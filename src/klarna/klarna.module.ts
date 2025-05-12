import { Module } from '@nestjs/common';
import { KlarnaController } from './klarna.controller';
import { KlarnaService } from './klarna.service';
import {KlarnaAxios} from "./klarna.axios";

@Module({
    controllers: [KlarnaController],
    providers: [KlarnaService, KlarnaAxios],
})
export class KlarnaModule {}