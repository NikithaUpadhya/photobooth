import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StripsController } from './strips.controller.js';
import { StripsService } from './strips.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StripsController],
  providers: [StripsService],
})
export class StripsModule {}