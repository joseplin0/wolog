import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RegistryService {
  constructor(private prisma: PrismaService) {}

  /** 获取所有启用的外部子应用 (前端注册表 API) */
  async getEnabledApps() {
    const apps = await this.prisma.subApp.findMany({
      where: { enabled: true, builtIn: false },
      orderBy: { createdAt: 'asc' },
    });

    return apps.map((app) => ({
      id: app.appId,
      name: app.name,
      icon: app.icon,
      entry: app.entry,
      activeRule: app.activeRule,
      requireAuth: app.requireAuth,
      builtIn: app.builtIn,
      backendUrl: app.backendUrl,
    }));
  }

  /** 注册一个新的外部子应用 */
  async registerApp(data: {
    appId: string;
    name: string;
    icon: string;
    entry: string;
    activeRule: string;
    backendUrl?: string;
    requireAuth?: boolean;
  }) {
    return this.prisma.subApp.create({
      data: {
        appId: data.appId,
        name: data.name,
        icon: data.icon,
        entry: data.entry,
        activeRule: data.activeRule,
        backendUrl: data.backendUrl,
        requireAuth: data.requireAuth ?? true,
        builtIn: false,
      },
    });
  }
}
