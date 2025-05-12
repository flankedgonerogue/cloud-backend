import {Controller, Post, Body, Patch, Header} from '@nestjs/common';
import { KlarnaService } from './klarna.service';
import { MerchantSession } from '../../lib/helper';
import { ICreateSession, IUpdateSession, ICreateOrder } from '../../lib/helper';

@Controller('klarna')
export class KlarnaController {
    constructor(private readonly klarnaService: KlarnaService) {}

    @Post('session')
    async createSession(
        @Body() createSessionDto: ICreateSession,
    ): Promise<MerchantSession> {
        return this.klarnaService.createSession(createSessionDto);
    }

    @Patch('session')
    async updateSession(
        @Body() updateSessionDto: IUpdateSession,
    ): Promise<void> {
        return this.klarnaService.updateSession(updateSessionDto);
    }

    @Post('order')
    async createOrder(
        @Body() createOrderDto: ICreateOrder,
    ): Promise<{ redirect_url: string }> {
        return this.klarnaService.createOrder(createOrderDto);
    }
}