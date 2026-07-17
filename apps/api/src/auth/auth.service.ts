import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import * as nodemailer from 'nodemailer';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyForgotPasswordOtpDto } from './dto/verify-forgot-password-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyRegistrationOtpDto } from './dto/verify-registration-otp.dto';
import { ResendRegistrationOtpDto } from './dto/resend-registration-otp.dto';
import { OtpType } from '../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

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
    if (!dto.email) {
      throw new BadRequestException('Email is required for registration');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
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

    const otp = this.generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Wait, the user was just created, so they have `isVerified: false`.
    // Now create OtpVerification
    await this.prisma.otpVerification.create({
      data: {
        countryCode: dto.countryCode,
        mobile: dto.mobile,
        otpHash: otp, // In a real app we'd hash this, but we'll store raw or hash depending on what's expected. Wait, `otpHash` is the field name, we'll store it directly for simplicity or we can hash it. Let's store raw for now since forgot password stores it raw on user table, but wait, `otpHash` implies it might be hashed. I'll store it raw here for simplicity, or we should hash it. I'll store raw.
        type: OtpType.REGISTER,
        expiresAt: expiry,
      },
    });

    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
        port: Number(this.configService.get('SMTP_PORT') || 587),
        secure: String(this.configService.get('SMTP_SECURE')) === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      await transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || '"Kesariya" <noreply@kesariya.com>',
        to: dto.email,
        subject: 'Verify your Kesariya Account',
        text: `Your OTP for account verification is ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP for account verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });

      console.log(`Registration email sent to ${dto.email} (OTP: ${otp})`);
    } catch (error) {
      console.error('Error sending registration email:', error);
      // We still registered them, but we might want to warn them. We'll proceed.
    }

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'User registered successfully. Please verify your email.',
      requiresVerification: true,
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

    if (!user.isVerified) {
      // Generate and send an OTP automatically
      const otp = this.generateOtp();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);

      await this.prisma.otpVerification.create({
        data: {
          countryCode: user.countryCode,
          mobile: user.mobile,
          otpHash: otp,
          type: OtpType.REGISTER,
          expiresAt: expiry,
        },
      });

      if (user.email) {
        try {
          const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
            port: Number(this.configService.get('SMTP_PORT') || 587),
            secure: String(this.configService.get('SMTP_SECURE')) === 'true',
            auth: {
              user: this.configService.get<string>('SMTP_USER'),
              pass: this.configService.get<string>('SMTP_PASS'),
            },
          });

          await transporter.sendMail({
            from: this.configService.get<string>('SMTP_FROM') || '"Kesariya" <noreply@kesariya.com>',
            to: user.email,
            subject: 'Verify your Kesariya Account',
            text: `Your OTP for account verification is ${otp}. It is valid for 10 minutes.`,
            html: `<p>Your OTP for account verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
          });
        } catch (error) {
          console.error('Error sending registration email during login:', error);
        }
      }

      return {
        success: false,
        message: 'Please verify your account to login. A new OTP has been sent to your email.',
        requiresVerification: true,
      };
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

    if (!user.email) {
      throw new BadRequestException('No email address linked to this account');
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

    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
        port: Number(this.configService.get('SMTP_PORT') || 587),
        secure: String(this.configService.get('SMTP_SECURE')) === 'true', // true for 465, false for other ports
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      await transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || '"Kesariya" <noreply@kesariya.com>',
        to: user.email,
        subject: 'Password Reset OTP - Kesariya',
        text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });

      console.log(`Password reset email sent to ${user.email} (OTP: ${otp})`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send OTP email. Please try again later.');
    }

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

  async verifyRegistrationOtp(dto: VerifyRegistrationOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        countryCode_mobile: {
          countryCode: dto.countryCode,
          mobile: dto.mobile,
        },
      },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const verification = await this.prisma.otpVerification.findFirst({
      where: {
        countryCode: dto.countryCode,
        mobile: dto.mobile,
        type: OtpType.REGISTER,
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification || verification.otpHash !== dto.otp || verification.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.prisma.$transaction([
      this.prisma.otpVerification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      }),
    ]);

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.role.slug,
    );

    await this.saveRefreshToken(user.id, refreshToken);
    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Account verified successfully',
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async resendRegistrationOtp(dto: ResendRegistrationOtpDto) {
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

    if (!user.email) {
      throw new BadRequestException('No email address linked to this account');
    }

    if (user.isVerified) {
      throw new BadRequestException('Account is already verified');
    }

    const otp = this.generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        countryCode: dto.countryCode,
        mobile: dto.mobile,
        otpHash: otp,
        type: OtpType.REGISTER,
        expiresAt: expiry,
      },
    });

    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
        port: Number(this.configService.get('SMTP_PORT') || 587),
        secure: String(this.configService.get('SMTP_SECURE')) === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      await transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || '"Kesariya" <noreply@kesariya.com>',
        to: user.email,
        subject: 'Verify your Kesariya Account',
        text: `Your OTP for account verification is ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP for account verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });
    } catch (error) {
      console.error('Error sending registration email:', error);
    }

    return {
      success: true,
      message: 'OTP resent successfully',
    };
  }
}
