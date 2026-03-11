import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, displayName: true, email: true, avatar: true, createdAt: true },
    });
  }

  async updateProfile(id: string, data: { displayName?: string; email?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, displayName: true, email: true, avatar: true, createdAt: true },
    });
  }
}
