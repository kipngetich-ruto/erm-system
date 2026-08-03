import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly service: PrescriptionsService) {}

  @Get()
  @Roles('admin', 'doctor', 'pharmacist', 'nurse')
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    // Doctors see only their own prescriptions
    if (req.user.role === 'doctor') doctorId = req.user.userId;
    // Pharmacists see all active (or all)
    return this.service.findAll({ patientId, doctorId, status });
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'pharmacist')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const p = await this.service.findOne(id);
    if (req.user.role === 'doctor' && p.doctorId !== req.user.userId) {
      throw new ForbiddenException('You can only view your own prescriptions');
    }
    return p;
  }

  @Post()
  @Roles('admin', 'doctor')
  async create(@Body() dto: CreatePrescriptionDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Put(':id')
  @Roles('admin', 'doctor', 'pharmacist')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDto,
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