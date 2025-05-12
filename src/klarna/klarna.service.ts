import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {KlarnaAxios} from "./klarna.axios";
import {
    CartItem,
    getProductById,
    getVariantById, ICreateOrder,
    ICreateSession,
    IOrderLine, IUpdateSession,
    MerchantSession
} from "../../lib/helper";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class KlarnaService {
    constructor(private readonly klarnaAxios: KlarnaAxios, private configService: ConfigService) {}

    private mapCartToOrderLines(cartItems: CartItem[]): IOrderLine[] {
        // Clean the cart items
        const items = cartItems
            .map((item) => {
                const product = getProductById(item.productId);
                const variant = getVariantById(item.variantId);

                if (!product || !variant) {
                    return null;
                }

                return {
                    product,
                    variant,
                    quantity: item.quantity,
                };
            })
            .filter((item) => item != null);

        return items.map((item): IOrderLine => {
            return {
                name: `Pond ${item.variant.name} - ${item.product.name}`,
                quantity: item.quantity,
                total_amount: item.quantity * item.variant.unitPrice * (1 + item.variant.taxRate) * 100,
                tax_rate: item.variant.taxRate,
                unit_price: item.variant.unitPrice * 100,
                image_url: encodeURI(this.configService.getOrThrow('SELF_BASE_URL') + "pond/" + item.variant.name + "/" + item.product.name + ".jpg"),
                product_url: this.configService.getOrThrow('SELF_BASE_URL'),
                type: "physical",
            };
        });
    }


    async createSession(props: ICreateSession): Promise<MerchantSession> {
        if (props.items.length === 0) throw new Error('Item length cannot be zero');

        const order_lines = this.mapCartToOrderLines(props.items);

        const data = {
            acquiring_channel: 'ECOMMERCE',
            intent: 'buy',
            purchase_country: 'SE',
            purchase_currency: 'SEK',
            locale: props.locale,
            order_amount: order_lines.reduce(
                (total: number, orderLine: { total_amount: number; }) => total + orderLine.total_amount,
                0,
            ),
            order_lines: order_lines,
            merchant_urls: {
                authorization: this.configService.getOrThrow<string>("SELF_KLARNA_AUTHORIZATION_CALLBACK_URL"),
            },
        };

        const response = await this.klarnaAxios.instance.post(
            this.configService.getOrThrow<string>("KLARNA_API_SESSION_CREATE_ENDPOINT"),
            JSON.stringify(data),
        );


        Logger.debug(`Create Session Klarna Response Status = ${response.status}`, 'CREATE_SESSION');
        Logger.debug(`Create Session Klarna Response Data = ${Object.keys(response.data)}`, 'CREATE_SESSION');

        if (response.status < 200 || response.status > 299) {
            throw new BadRequestException('Failed to create Session');
        }

        return response.data;
    }

    private getSessionUpdateUrl(sessionId: string): string {
        return this.configService.getOrThrow<string>('KLARNA_API_SESSION_UPDATE_ENDPOINT').replace(':id', sessionId);
    }

    async updateSession({ sessionId, locale, items }: IUpdateSession): Promise<void> {
        if (items.length === 0) throw new Error('Item length cannot be zero');

        const order_lines = this.mapCartToOrderLines(items);

        const data = {
            locale: locale,
            order_lines: order_lines,
            order_amount: order_lines.reduce(
                (total: number, orderLine: { total_amount: number }) => total + orderLine.total_amount,
                0,
            ),
        };

        const response = await this.klarnaAxios.instance.post(
            this.getSessionUpdateUrl(sessionId),
            JSON.stringify(data),
        );

        Logger.debug(`Update Session Klarna Response Status = ${response.status}`, 'UPDATE_SESSION');
        Logger.debug(`Update Session Klarna Response Data = ${response.data}`, 'UPDATE_SESSION');

        if (response.status < 200 || response.status > 299) {
            throw new BadRequestException('Failed to update Session');
        }
    }

    private getOrderCreationUrl(authorizationToken: string): string {
        return this.configService.getOrThrow<string>('KLARNA_API_ORDER_CREATION_ENDPOINT').replace(':token', authorizationToken);
    }

    private getLocalizedSelfUrl(url: string, locale: string): string {
        return url.replace(':base_url', this.configService.getOrThrow('SELF_BASE_URL')).replace(':locale', locale);
    }

    async createOrder(props: ICreateOrder): Promise<{ redirect_url: string }> {
        console.log('Hi')
        if (props.items.length === 0) throw new BadRequestException('Item length cannot be zero');

        const order_lines = this.mapCartToOrderLines(props.items);

        const data = {
            purchase_country: 'SE',
            purchase_currency: 'SEK',
            locale: props.locale,
            order_amount: order_lines.reduce(
                (total: number, orderLine: { total_amount: number }) => total + orderLine.total_amount,
                0,
            ),
            order_lines: order_lines,
            merchant_urls: {
                confirmation: this.getLocalizedSelfUrl(
                    this.configService.getOrThrow<string>('SELF_PAYMENT_SUCCESS_URL'),
                    props.locale
                ),
                notification: this.getLocalizedSelfUrl(
                    this.configService.getOrThrow<string>('SELF_PAYMENT_NOTIFICATION_URL'),
                    props.locale
                ),
            },
            shipping_address: props.shipping_address,
            billing_address: props.billing_address,
        };

        const response = await this.klarnaAxios.instance.post(
            this.getOrderCreationUrl(props.authorizationToken),
            JSON.stringify(data),
        );

        Logger.debug(`Create Order Klarna Response Status = ${response.status}`, 'CREATE_ORDER');
        Logger.debug(`Create Order Klarna Response Data = ${Object.keys(response.data)}`, 'CREATE_ORDER');

        if (response.status < 200 || response.status > 299) {
            return {
                redirect_url: this.getLocalizedSelfUrl(
                    this.configService.getOrThrow<string>('SELF_PAYMENT_ERROR_URL'),
                    props.locale
                ),
            };
        }

        const responseData = response.data;

        Logger.debug(`Create Order Response order_id: ${responseData.order_id}`, "CREATE_ORDER");

        return {
            redirect_url: responseData.redirect_url?.length > 0
                ? responseData.redirect_url
                : this.getLocalizedSelfUrl(
                    this.configService.getOrThrow<string>('SELF_PAYMENT_ERROR_URL'),
                    props.locale
                ),
        };
    }
}