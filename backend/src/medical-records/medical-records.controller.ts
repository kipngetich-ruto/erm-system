import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  @Roles('admin', 'doctor', 'nurse')
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('search') search?: string,
    @Request() req?: any,
  ) {
    // Doctors can only see their own records, or records of their patients
    if (req.user.role === 'doctor') {
      // If doctorId is not provided, filter by the logged-in doctor
      if (!doctorId) {
        doctorId = req.user.userId;
      }
    }
    return this.medicalRecordsService.findAll({ patientId, doctorId, search });
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'nurse')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const record = await this.medicalRecordsService.findOne(id);
    // Doctors can only view records they created
    if (req.user.role === 'doctor' && record.doctorId !== req.user.userId) {
      throw new ForbiddenException('You can only view your own medical records');
    }
    return record;
  }

  @Post()
  @Roles('admin', 'doctor')
  async create(@Body() createDto: CreateMedicalRecordDto, @Request() req: any) {
    return this.medicalRecordsService.create(createDto, req.user.userId);
  }

  @Put(':id')
  @Roles('admin', 'doctor')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMedicalRecordDto,
    @Request() req: any,
  ) {
    return this.medicalRecordsService.update(id, updateDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @Roles('admin', 'doctor')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.medicalRecordsService.remove(id, req.user.userId, req.user.role);
  }
}