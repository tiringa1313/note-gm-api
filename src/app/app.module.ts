import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carrega variáveis do .env automaticamente
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL') || 
             'postgresql://frota_db_gu2a_user:t2QPsGG2gzMnL99EYvTsLVqCFMg21CJR@dpg-cuv1udt6l47c73eemtt0-a.oregon-postgres.render.com:5432/frota_db_gu2a', // 🔥 Agora com a porta correta
        autoLoadEntities: true, 
        synchronize: true, // ❌ Nunca use true em produção
      }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}

