import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('apps')
export class RegistryController {
  constructor(private registryService: RegistryService) {}

  /** GET /api/apps/registry — 公开接口，前端拉取子应用列表 */
  @Get('registry')
  async getRegistry() {
    return this.registryService.getEnabledApps();
  }

  /** POST /api/apps/register — 需要管理员权限（暂用 JWT 守卫） */
  @UseGuards(JwtAuthGuard)
  @Post('register')
  async registerApp(
    @Body()
    body: {
      appId: string;
      name: string;
      icon: string;
      entry: string;
      activeRule: string;
      backendUrl?: string;
      requireAuth?: boolean;
    },
  ) {
    return this.registryService.registerApp(body);
  }
}
