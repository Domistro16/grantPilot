import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { getDatabaseConfig } from './config/database.config';

// Feature modules
import { GrantsModule } from './modules/grants/grants.module';
import { ChainsModule } from './modules/chains/chains.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { AiModule } from './modules/ai/ai.module';
import { ScraperModule } from './modules/scraper/scraper.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('rateLimit.ttl') || 900000,
            limit: configService.get<number>('rateLimit.max') || 100,
          },
        ],
      }),
    }),

    // Feature modules
    GrantsModule,
    ChainsModule,
    CategoriesModule,
    SubscriptionsModule,
    AiModule,
    ScraperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
