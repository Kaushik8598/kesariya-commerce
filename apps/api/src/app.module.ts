import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistsModule } from './wishlists/wishlists.module';

import { envSchema } from './config/env.validation';
import { CartsModule } from './carts/carts.module';
import { CouponsModule } from './coupons/coupons.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (env) => envSchema.parse(env),
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    ProductsModule,
    ReviewsModule,
    WishlistsModule,
    CartsModule,
    CouponsModule,
    CheckoutModule,
    OrdersModule,
    LocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

