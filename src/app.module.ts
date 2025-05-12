import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from "@nestjs/config";
import {KlarnaModule} from "./klarna/klarna.module";

@Module({
  imports: [ConfigModule.forRoot(
      {
        isGlobal: true,
      }
  ), KlarnaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
