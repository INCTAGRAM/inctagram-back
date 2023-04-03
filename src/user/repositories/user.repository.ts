import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto, hash: string) {
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        hash: hash,
        emailConfirmation: {
          create: {
            confirmationCode: randomUUID(),
            expirationDate: add(new Date(), {
              minutes: 1,
            }).toISOString(),
            isConfirmed: false,
          },
        },
        passwordRecovery: { create: {} },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        emailConfirmation: {
          select: {
            confirmationCode: true,
          },
        },
      },
    });
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email } });
  }
}
