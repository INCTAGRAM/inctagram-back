import { Module } from '@nestjs/common';
import { DeviceSessionsRepository } from './repositories/device-sessions.repository';
import { DeviceSessionsController } from './api/device-sessions.controller';

@Module({
  imports: [],
  controllers: [DeviceSessionsController],
  providers: [DeviceSessionsRepository],
  exports: [DeviceSessionsRepository],
})
export class DeviceSessionsModule {}
