import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Get()
  @Roles('admin', 'billing', 'doctor', 'receptionist')
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ patientId, status });
  }

  @Get(':id')
  @Roles('admin', 'billing', 'doctor')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'billing')
  async create(@Body() dto: CreateBillingDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Put(':id')
  @Roles('admin', 'billing')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBillingDto,
    @Request() req: any,
  ) {
    return this.service.update(id, dto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user.userId, req.user.role);
  }
}