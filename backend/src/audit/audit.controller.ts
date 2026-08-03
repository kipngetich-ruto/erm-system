import { Controller, Get, UseGuards, Query, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('admin')
  async findAll(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
  ) {
    const take = limit ? parseInt(limit, 10) : 50;
    const skip = offset ? parseInt(offset, 10) : 0;
    return this.auditService.findAll(take, skip);
  }
}