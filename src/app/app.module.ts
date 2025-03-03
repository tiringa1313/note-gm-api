import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';  // Caminho atualizado
import { AuthModule } from '../auth/auth.module';    // Caminho atualizado


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carrega variáveis do .env automaticamente
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true, // Carrega todas as entidades automaticamente
        synchronize: configService.get<boolean>('DB_SYNC') || false, // ❌ Mantenha `false` em produção
      }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
