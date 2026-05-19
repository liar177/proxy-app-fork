import { Module } from '@nestjs/common';
import { ProjectModule } from './project/project.module';
import { ProxyModule } from './proxy/proxy.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    StorageModule,
    ProjectModule,
    ProxyModule,
  ],
})
export class AppModule {}
