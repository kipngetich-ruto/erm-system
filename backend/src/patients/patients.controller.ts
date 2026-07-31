import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { userId: string; email: string; role: string };
}

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech', 'billing')
  async findAll(@Query('search') search?: string) {
    return this.patientsService.findAll(search);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech', 'billing')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'receptionist')
  async create(@Body() createPatientDto: CreatePatientDto, @Request() req: RequestWithUser) {
    return this.patientsService.create(createPatientDto, req.user.userId);
  }

  @Put(':id')
  @Roles('admin', 'receptionist')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Request() req: RequestWithUser
  ) {
    return this.patientsService.update(id, updatePatientDto, req.user.userId);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: RequestWithUser) {
    return this.patientsService.remove(id, req.user.userId);
  }
}