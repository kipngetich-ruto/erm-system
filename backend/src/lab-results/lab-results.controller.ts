import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { LabResultsService } from './lab-results.service';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { UpdateLabResultDto } from './dto/update-lab-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('lab-results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabResultsController {
  constructor(private readonly service: LabResultsService) {}

  @Get()
  @Roles('admin', 'doctor', 'lab_tech', 'nurse')
  async findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    if (req.user.role === 'doctor') doctorId = req.user.userId;
    return this.service.findAll({ patientId, doctorId, status });
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'lab_tech')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const lab = await this.service.findOne(id);
    if (req.user.role === 'doctor' && lab.doctorId !== req.user.userId) {
      throw new ForbiddenException('You can only view your own lab requests');
    }
    return lab;
  }

  @Post()
  @Roles('admin', 'doctor')
  async create(@Body() dto: CreateLabResultDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Put(':id')
  @Roles('admin', 'doctor', 'lab_tech')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLabResultDto,
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