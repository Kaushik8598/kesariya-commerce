import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('profile')
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @ApiOperation({ summary: 'Update profile' })
  @Patch('profile')
  updateProfile(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.usersService.updateProfile(userId, data);
  }

  @ApiOperation({ summary: 'Get user addresses' })
  @Get('addresses')
  getAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @ApiOperation({ summary: 'Add a new address' })
  @Post('addresses')
  addAddress(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.usersService.addAddress(userId, data);
  }

  @ApiOperation({ summary: 'Update an address' })
  @Patch('addresses/:id')
  updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() data: any,
  ) {
    return this.usersService.updateAddress(userId, addressId, data);
  }

  @ApiOperation({ summary: 'Delete an address' })
  @Delete('addresses/:id')
  deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.usersService.deleteAddress(userId, addressId);
  }

  @ApiOperation({ summary: 'Update password' })
  @Patch('password')
  updatePassword(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.usersService.updatePassword(userId, data);
  }

  @ApiOperation({ summary: 'Update notification preferences' })
  @Patch('notifications')
  updateNotifications(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.usersService.updateNotifications(userId, data);
  }
}
