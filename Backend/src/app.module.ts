import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { LecturersModule } from './lecturers/lecturers.module';
import { DepartmentsModule } from './departments/departments.module';
import { CoursesModule } from './courses/courses.module';
import { SemestersModule } from './semesters/semesters.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { GradesModule } from './grades/grades.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';

// Config
import { validateEnv } from './config/env.validation';
import { mongooseConfig } from './config/database.config';

// Guards
import { PublicAuthGuard } from './common/guards/public-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Filters & Interceptors
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 1000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mongooseConfig,
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    StudentsModule,
    LecturersModule,
    DepartmentsModule,
    CoursesModule,
    SemestersModule,
    RegistrationsModule,
    GradesModule,
    AnnouncementsModule,
    NotificationsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: PublicAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global Filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
