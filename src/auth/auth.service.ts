import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // 🔹 REGISTRO DE USUÁRIO
  async register(registerDto: RegisterDto) {
    if (
      !registerDto ||
      !registerDto.email ||
      !registerDto.name ||
      !registerDto.password
    ) {
      throw new BadRequestException('Todos os campos são obrigatórios');
    }

    const { name, email, password } = registerDto;

    // 🔹 Normaliza os inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 🔹 Validação extra para senha segura
    if (password.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
    }

    // 🔹 Verifica se o e-mail é válido via API Mailboxlayer
    const isEmailValid = await this.verifyEmailAPI(cleanEmail);
    if (!isEmailValid) {
      throw new BadRequestException('E-mail inválido ou inexistente');
    }

    // 🔹 Verifica se o e-mail já está cadastrado
    const existingUser = await this.usersService.findOneByEmail(cleanEmail);
    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    try {
      // 🔹 Hash da senha antes de salvar
      const hashedPassword = await bcrypt.hash(password, 10);

      // 🔹 Criação do usuário no banco de dados
      const newUser = await this.usersService.create(
        cleanName,
        cleanEmail,
        hashedPassword,
      );

      return { message: 'Usuário criado com sucesso', userId: newUser.id };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw new InternalServerErrorException(
        'Erro ao registrar usuário. Tente novamente.',
      );
    }
  }

  // 🔹 FUNÇÃO PARA VERIFICAR O E-MAIL VIA MAILBOXLAYER
  async verifyEmailAPI(email: string): Promise<boolean> {
    const apiKey = 'be4c19ceb5ab30630074bb359fe99a06'; // 🔹 Substitua pela sua chave da API
    const url = `http://apilayer.net/api/check?access_key=${apiKey}&email=${email}&smtp=1&format=1`;

    try {
      const response = await axios.get(url);
      console.log('🔍 Resposta da API:', response.data); // Para debug

      return (
        response.data.format_valid &&
        response.data.mx_found &&
        response.data.smtp_check
      );
    } catch (error) {
      console.error('Erro ao validar e-mail:', error);
      return false;
    }
  }

  // 🔹 LOGIN: Gera Access e Refresh Token
  async login(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email, true);

    if (!user) {
      throw new UnauthorizedException('Usuário não registrado');
    }

    // 🔹 Comparando a senha digitada com o hash armazenado no banco
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Senha informada não confere');
    }

    console.log('✅ Login bem-sucedido!');
    return this.generateTokens(user.id, user.email);
  }

  // 🔹 GERA ACCESS TOKEN E REFRESH TOKEN
  private generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '1d' });

    return { accessToken, refreshToken };
  }

  // 🔹 REFRESH TOKEN: Renova o Access Token
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      return this.generateTokens(payload.sub, payload.email);
    } catch (error) {
      throw new UnauthorizedException('Refresh Token inválido ou expirado');
    }
  }
}
