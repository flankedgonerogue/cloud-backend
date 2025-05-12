import { Injectable } from '@nestjs/common';
import Axios, {AxiosInstance} from 'axios';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class KlarnaAxios {
    public readonly instance: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        this.instance = Axios.create({
            headers: {
                Authorization: `Basic ${this.configService.getOrThrow('KLARNA_API_PASSWORD')}`,
                'Content-Type': 'application/json',
            },
        })
    }
}