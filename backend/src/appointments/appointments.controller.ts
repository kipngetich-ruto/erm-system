import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles('admin', 'receptionist', 'doctor', 'nurse')
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Request() req?: any,
  ) {
    // Doctors can only see their own appointments
    if (req.user.role === 'doctor') {
      doctorId = req.user.userId;
    }
    return this.appointmentsService.findAll({ patientId, doctorId, status, fromDate, toDate });
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'doctor', 'nurse')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const appointment = await this.appointmentsService.findOne(id);
    // Doctors can only view their own appointments
    if (req.user.role === 'doctor' && appointment.doctorId !== req.user.userId) {
      throw new ForbiddenException('You can only view your own appointments');
    }
    return appointment;
  }

  @Post()
  @Roles('admin', 'receptionist')
  async create(@Body() createDto: CreateAppointmentDto, @Request() req: any) {
    return this.appointmentsService.create(createDto, req.user.userId);
  }

  @Put(':id')
  @Roles('admin', 'receptionist', 'doctor')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAppointmentDto,
    @Request() req: any,
  ) {
    return this.appointmentsService.update(id, updateDto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @Roles('admin', 'doctor')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.appointmentsService.remove(id, req.user.userId, req.user.role);
  }
}