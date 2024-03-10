export interface IProduct {
    id: number;
    product: string;
    price: any;
    brand?: string;
}

export interface ISearchParams {
    price: number | 0
    name: string
    brand: string
}