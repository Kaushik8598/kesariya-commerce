import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Measurements')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @ApiOperation({ summary: 'Get available measurement types' })
  @Get('types')
  getTypes() {
    return this.measurementsService.getTypes();
  }

  @ApiOperation({ summary: 'Create a measurement profile' })
  @Post()
  create(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.measurementsService.create(userId, data);
  }

  @ApiOperation({ summary: 'Get all measurement profiles' })
  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.measurementsService.findAll(userId);
  }

  @ApiOperation({ summary: 'Get a measurement profile by id' })
  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.measurementsService.findOne(userId, id);
  }

  @ApiOperation({ summary: 'Update a measurement profile' })
  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.measurementsService.update(userId, id, data);
  }

  @ApiOperation({ summary: 'Set measurement profile as default' })
  @Patch(':id/default')
  setDefault(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.measurementsService.setDefault(userId, id);
  }

  @ApiOperation({ summary: 'Delete a measurement profile' })
  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.measurementsService.remove(userId, id);
  }
}

