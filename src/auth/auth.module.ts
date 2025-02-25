import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // 🔹 Carrega variáveis de ambiente (`.env`)
    UsersModule, // 🔥 Importa módulo de usuários para acessar o banco
    PassportModule.register({ defaultStrategy: 'jwt' }), // 🔹 Registra estratégia `jwt`
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // 🔥 Pega o segredo do `.env`
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // 🔥 Garante que `JwtStrategy` está registrado
  exports: [AuthService, JwtStrategy, PassportModule], // 🔹 Exporta para outros módulos
})
export class AuthModule {}
