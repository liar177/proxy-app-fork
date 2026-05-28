import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { ProjectModule } from './project/project.module';
import { ProxyModule } from './proxy/proxy.module';
import { StorageModule } from './storage/storage.module';
import { ProxyToolsService } from './mcp/proxy-tools.service';

@Module({
  imports: [
    StorageModule,
    ProjectModule,
    ProxyModule,
    McpModule.forRoot({
      name: 'proxy-mcp-server',
      version: '1.0.0',
      description: '代理项目管理 MCP Server — 支持代理配置的增删改查和启停控制',
      transport: McpTransportType.STREAMABLE_HTTP,
      mcpEndpoint: '/mcp',
      streamableHttp: {
        enableJsonResponse: true,
        statelessMode: true,
      },
    }),
  ],
  providers: [ProxyToolsService],
})
export class AppModule {}
