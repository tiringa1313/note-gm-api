import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔹 Protege a rota de listagem de usuários (opcional)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers() {
    return this.usersService.findAll();
  }

  // 🔹 Criando usuário com validação adequada
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    if (!name || !email || !password) {
      throw new BadRequestException(
        'Os campos nome, email e senha são obrigatórios.',
      );
    }

    return this.usersService.create(name, email, password);
  }

  // 🔥 NOVA ROTA: Obtém o perfil do usuário autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return {
      message: 'Perfil do usuário encontrado!',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    };
  }
}
