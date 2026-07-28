import { Controller, Get, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './db/schema';
import { EncryptionService } from './encryption/encryption.service';

@Controller()
export class AppController {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private encryptionService: EncryptionService,
  ) {}

  @Get()
  getHello(): string {
    return 'EMR System API is running!';
  }

  @Get('test-db')
  async testDatabase() {
    try {
      const result = await this.db.execute('SELECT NOW() as current_time');
      return {
        success: true,
        message: 'Database connection successful',
        serverTime: result.rows[0].current_time,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }

  @Get('test-encryption')
  testEncryption() {
    const plaintext = 'Sensitive medical data';
    const encrypted = this.encryptionService.encrypt(plaintext);
    const decrypted = this.encryptionService.decrypt(encrypted);
    return {
      plaintext,
      encrypted,
      decrypted,
      success: plaintext === decrypted,
    };
  }
}
