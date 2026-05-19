import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { StorageModule } from '../storage/storage.module';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [StorageModule, ProxyModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
