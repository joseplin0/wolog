import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RegistryModule } from './modules/registry/registry.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, UserModule, RegistryModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
