import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @ApiOperation({ summary: 'Get all active countries' })
  @Get('countries')
  getCountries() {
    return this.locationsService.getCountries();
  }

  @ApiOperation({ summary: 'Get states by country' })
  @ApiQuery({ name: 'countryId', required: true })
  @Get('states')
  getStates(@Query('countryId') countryId: string) {
    return this.locationsService.getStates(countryId);
  }

  @ApiOperation({ summary: 'Get cities by state' })
  @ApiQuery({ name: 'stateId', required: true })
  @Get('cities')
  getCities(@Query('stateId') stateId: string) {
    return this.locationsService.getCities(stateId);
  }
}

