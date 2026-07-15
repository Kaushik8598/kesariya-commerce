import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyForgotPasswordOtpDto } from './dto/verify-forgot-password-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async generateTokens(userId: string, role: string) {
    const payload = {
      sub: userId,
      role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  private generateOtp() {
    return randomInt(100000, 999999).toString();
  }

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

    const role = await this.prisma.role.findUnique({
      where: {
        id: user.roleId,
      },
    });

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      role!.slug,
    );

    await this.saveRefreshToken(user.id, refreshToken);

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: userWithoutPassword,
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

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.role.slug,
    );

    await this.saveRefreshToken(user.id, refreshToken);

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const decoded = await this.jwtService.verifyAsync(dto.refreshToken, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
    });

    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: decoded.sub,
        revokedAt: null,
      },
    });

    const matchedToken = await Promise.any(
      tokens.map(async (token) => {
        const isValid = await bcrypt.compare(dto.refreshToken, token.tokenHash);

        return isValid ? token : Promise.reject();
      }),
    ).catch(() => null);

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: decoded.sub,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    await this.prisma.refreshToken.update({
      where: {
        id: matchedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.role.slug,
    );

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string, dto: RefreshTokenDto) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
      },
    });

    let tokenId: string | null = null;

    for (const token of tokens) {
      const matched = await bcrypt.compare(dto.refreshToken, token.tokenHash);

      if (matched) {
        tokenId = token.id;
        break;
      }
    }

    if (!tokenId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: {
        id: tokenId,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Logged out from all devices',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        countryCode_mobile: {
          countryCode: dto.countryCode,
          mobile: dto.mobile,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (
      user.forgotPasswordOtpSentAt &&
      Date.now() - user.forgotPasswordOtpSentAt.getTime() < 30_000
    ) {
      throw new UnauthorizedException(
        'Please wait 30 seconds before requesting another OTP',
      );
    }

    const otp = this.generateOtp();

    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        forgotPasswordOtp: otp,
        forgotPasswordOtpExpiry: expiry,
        forgotPasswordOtpSentAt: new Date(),
      },
    });

    // TODO: SMS Provider
    console.log('Forgot Password OTP:', otp);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  async verifyForgotPasswordOtp(dto: VerifyForgotPasswordOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        countryCode_mobile: {
          countryCode: dto.countryCode,
          mobile: dto.mobile,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (
      user.forgotPasswordOtp !== dto.otp ||
      !user.forgotPasswordOtpExpiry ||
      user.forgotPasswordOtpExpiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        countryCode_mobile: {
          countryCode: dto.countryCode,
          mobile: dto.mobile,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (
      user.forgotPasswordOtp !== dto.otp ||
      !user.forgotPasswordOtpExpiry ||
      user.forgotPasswordOtpExpiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        forgotPasswordOtp: null,
        forgotPasswordOtpExpiry: null,
        forgotPasswordOtpSentAt: null,
      },
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
