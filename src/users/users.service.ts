import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(name: string, email: string, password: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const newUser = this.userRepository.create({
      name,
      email: cleanEmail,
      password: password,
    });
  
    return await this.userRepository.save(newUser);
  }
  
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.userRepository.find({
      select: ['id', 'name', 'email'], // 🔹 Retorna apenas os campos necessários
    });
  }

  async findOneByEmail(email: string, withPassword = false): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase(); // 🔥 Normaliza o e-mail

    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: cleanEmail });
  
    if (withPassword) {
      query.addSelect('user.password'); // 🔹 Carrega a senha se necessário
    }
  
    const user = await query.getOne();
    return user;
  }
  
  
}
