import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(dto.email ? [{ email: dto.email }] : []),
          {
            countryCode: dto.countryCode,
            mobile: dto.mobile,
          },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        countryCode: dto.countryCode,
        mobile: dto.mobile,
        password: hashedPassword,
        role: {
          connect: {
            slug: 'customer',
          },
        },
      },
    });

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'User registered successfully',
      data: userWithoutPassword,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        countryCode_mobile: {
          countryCode: dto.countryCode,
          mobile: dto.mobile,
        },
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password!);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      role: user.role.slug,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: userWithoutPassword,
    };
  }
}
