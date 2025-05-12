export const products: Product[] = [
    {
        id: 1,
        name: "Morel Brown",
        hex: "#A58D71",
        description: "Pantone 532 C",
        shade: "Dark",
        image: '/pond/55"/Morel Brown.jpg',
    },
    {
        id: 2,
        name: "Stellar",
        description: "Pantone 3715C",
        hex: "#0A0A0A",
        shade: "Dark",
        image: '/pond/55"/Stellar.jpg',
    },
    {
        id: 3,
        name: "Forest Green",
        description: "Pantone 532 C",
        hex: "#4F5D49",
        shade: "Dark",
        image: '/pond/55"/Forest Green.jpg',
    },
    {
        id: 4,
        name: "Snowdrift",
        description: "Pantone 532 C",
        hex: "#F2EDE4",
        shade: "Light",
        image: '/pond/55"/Snowdrift.jpg',
    },
];

export const variants: Variant[] = [
    { id: 1, name: '32"', unitPrice: 4900, taxRate: 0.25 },
    { id: 2, name: '43"', unitPrice: 6900, taxRate: 0.25 },
    { id: 3, name: '55"', unitPrice: 9900, taxRate: 0.25 },
];


export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("se-SE", {
        style: "currency",
        currency: "SEK",
        trailingZeroDisplay: "stripIfInteger",
    }).format(value);
}

export function getProductById(productId: number): Product | undefined {
    return products.find((product) => product.id === productId);
}

export function getVariantById(variantId: number): Variant | undefined {
    return variants.find((variant) => variant.id === variantId);
}

export function getVariantUnitPrice(variantId: number): number {
    const variant = getVariantById(variantId);
    if (!variant) return 0;

    return variant.unitPrice;
}


export interface Variant {
    id: number;
    name: string;
    unitPrice: number;
    taxRate: number;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    hex: string;
    shade: "Dark" | "Light";
    image: string;
}

export interface CartItem {
    productId: number;
    variantId: number;
    quantity: number;
}


export interface MerchantSession {
    client_token: string; // Client token to initialize the JS SDK
    session_id: string; // Session ID for identifying issues with Klarna
    payment_method_categories?: PaymentMethodCategory[]; // Optional list of available payment method categories
}

interface PaymentMethodCategory {
    asset_urls?: AssetUrls; // Optional URLs for assets associated with the payment method
    identifier?: string; // e.g., "klarna", "pay_now", etc.
    name?: string; // Display name like "Pay with Klarna"
}

interface AssetUrls {
    descriptive?: string; // URL of the descriptive asset
    standard?: string; // URL of the standard asset
}

export interface IOrderLine {
    name: string;
    quantity: number;
    total_amount: number;
    unit_price: number;
    image_url?: string;
    merchant_data?: string;
    product_identifiers?: {
        brand?: string;
        category_path?: string;
        global_trade_item_number?: string;
        manufacturer_part_number?: string;
        color?: string;
        size?: string;
    };
    product_url?: string;
    quantity_unit?: string;
    reference?: string;
    tax_rate?: number;
    total_discount_amount?: number;
    total_tax_amount?: number;
    type?:
        | "physical"
        | "discount"
        | "shipping_fee"
        | "sales_tax"
        | "digital"
        | "gift_card"
        | "store_credit"
        | "surcharge";
    subscription?: {
        name: string;
        interval: "DAY" | "WEEK" | "MONTH" | "YEAR";
        interval_count: number;
    };
}

export interface ICreateSession {
    locale: string;
    items: CartItem[];
}

export interface IUpdateSession {
    sessionId: string;
    locale: string;
    items: CartItem[];
}

export interface ICreateOrder {
    locale: string;
    items: CartItem[];
    authorizationToken: string;
    billing_address: {
        given_name: string;
        family_name: string;
        email: string;
        street_address: string;
        postal_code: string;
        city: string;
        phone: string;
        country: string;
    };
    shipping_address: {
        given_name: string;
        family_name: string;
        email: string;
        street_address: string;
        postal_code: string;
        city: string;
        phone: string;
        country: string;
    };
}

