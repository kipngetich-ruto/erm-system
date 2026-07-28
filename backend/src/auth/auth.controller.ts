import { Controller, Post, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { Generate2FADto } from './dto/generate-2fa.dto';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { Disable2FADto } from './dto/disable-2fa.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ---- Registration ----
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.role,
    );
  }

  // ---- Login ----
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // ---- 2FA: Generate secret (Step 1) ----
  @Post('generate-2fa')
  async generate2FA(@Body() generate2FADto: Generate2FADto) {
    return this.authService.generate2FASecret(generate2FADto.email);
  }

  // ---- 2FA: Enable (Step 2) ----
  @Post('enable-2fa')
  async enable2FA(@Body() enable2FADto: Enable2FADto) {
    return this.authService.enableTwoFactor(enable2FADto.email, enable2FADto.totp);
  }

  // ---- 2FA: Verify (Step 3) ----
  @Post('verify-2fa')
  async verify2FA(@Body() verify2FADto: Verify2FADto) {
    return this.authService.verify2FA(verify2FADto.email, verify2FADto.totp);
  }

  // ---- 2FA: Disable ----
  @Post('disable-2fa')
  async disable2FA(@Body() disable2FADto: Disable2FADto) {
    return this.authService.disableTwoFactor(disable2FADto.email, disable2FADto.totp);
  }

  // ---- Refresh Token ----
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  // ---- Logout ----
  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}