import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { users, refreshTokens } from '../db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ---- Password Hashing ----
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  // ---- User Lookup ----
  async findUserByEmail(email: string) {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  // ---- JWT Token Generation ----
  generateAccessToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const hashedToken = await argon2.hash(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.db.insert(refreshTokens).values({
      userId,
      tokenHash: hashedToken,
      expiresAt,
    });

    return token;
  }

  // ---- 2FA ----
  generateTwoFactorSecret(email: string): speakeasy.GeneratedSecret {
    return speakeasy.generateSecret({
      name: `${this.configService.get('TOTP_ISSUER', 'EMR_System')}:${email}`,
    });
  }

  verifyTwoFactorToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  async generate2FASecret(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA already enabled');
    }
    const secret = this.generateTwoFactorSecret(email);
    // Temporarily store secret in user record (or in a separate table)
    // For simplicity, we'll save it immediately but keep isTwoFactorEnabled=false
    await this.db
      .update(users)
      .set({ twoFactorSecret: secret.base32 })
      .where(eq(users.id, user.id));
    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  // Enable 2FA for user after verifying TOTP
  async enableTwoFactor(email: string, totp: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA already enabled');
    }
    if (!user.twoFactorSecret) {
      throw new BadRequestException('No secret generated. Call /auth/generate-2fa first.');
    }

    const isValid = this.verifyTwoFactorToken(user.twoFactorSecret, totp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    await this.db
      .update(users)
      .set({ isTwoFactorEnabled: true })
      .where(eq(users.id, user.id));

    return { success: true, message: '2FA enabled successfully' };
  }

  async disableTwoFactor(email: string, totp: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }
    if (!user.twoFactorSecret) {
      throw new BadRequestException('No 2FA secret found');
    }

    // Verify TOTP to confirm user has authenticator access
    const isValid = this.verifyTwoFactorToken(user.twoFactorSecret, totp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    // Disable 2FA and optionally clear the secret
    await this.db
      .update(users)
      .set({
        isTwoFactorEnabled: false,
        twoFactorSecret: null, // optional: clear the secret
      })
      .where(eq(users.id, user.id));

    return { success: true, message: '2FA disabled successfully' };
  }

  async register(email: string, password: string, role: string = 'receptionist') {
    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Insert user
    const newUser = await this.db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: role as any,
        isTwoFactorEnabled: false,
      })
      .returning();

    const user = newUser[0];
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      message: 'User registered successfully',
    };
  }

  // ---- Login Logic ----
  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.verifyPassword(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // If 2FA is enabled, return challenge
    if (user.isTwoFactorEnabled) {
      return {
        requires2FA: true,
        message: '2FA code required',
        email: user.email,
      };
    }

    // Otherwise, issue tokens
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // ---- 2FA Verification ----
  async verify2FA(email: string, totp: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA not set up for this user');
    }

    const isValid = this.verifyTwoFactorToken(user.twoFactorSecret, totp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // ---- Refresh Token ----
  async refreshTokens(refreshToken: string) {
    const allTokens = await this.db.select().from(refreshTokens);
    let matchedToken: any = null; // ✅ use any
    for (const token of allTokens) {
      const isValid = await argon2.verify(token.tokenHash, refreshToken);
      if (isValid) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (matchedToken.revokedAt || matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    // Get user
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.id, matchedToken.userId))
      .limit(1);
    if (!user[0]) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old token
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, matchedToken.id));

    // Issue new tokens
    const newAccessToken = this.generateAccessToken(user[0].id, user[0].email, user[0].role);
    const newRefreshToken = await this.generateRefreshToken(user[0].id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ---- Change Password ----
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.verifyPassword(user[0].passwordHash, currentPassword);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newHash = await this.hashPassword(newPassword);
    await this.db
      .update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.id, userId));

    return { success: true, message: 'Password updated successfully' };
  }

  // ---- Logout ----
  async logout(refreshToken: string) {
    const allTokens = await this.db.select().from(refreshTokens);
    let matchedToken: any = null; // ✅ use any
    for (const token of allTokens) {
      const isValid = await argon2.verify(token.tokenHash, refreshToken);
      if (isValid) {
        matchedToken = token;
        break;
      }
    }
    if (matchedToken) {
      await this.db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.id, matchedToken.id));
    }
    return { success: true };
  }
}
