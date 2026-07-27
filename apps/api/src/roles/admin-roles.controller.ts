import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
export class AdminRolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('roleId') roleId?: string,
  ) {
    return this.rolesService.findAdminStaff(page, limit, search, roleId);
  }

  @Get('roles')
  getRoles() {
    return this.rolesService.findAllRoles();
  }

  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.rolesService.createStaff(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.rolesService.updateStaff(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.removeStaff(id);
  }
}
