import axios from "axios";
const API_URL = "http://api.valantis.store:40000/";
import { Md5 } from "ts-md5";
import { EAction } from "../enum/EAction";

export class AxiosApiClient {
    private async call (action: EAction, params?: any){
        try{
            const password = "Valantis"; 
            const timestamp = new Date().toISOString().slice(0,10).replace(/-/g,""); 
            const authString = Md5.hashStr(password + "_" + timestamp).toString();
        
            const response = await axios.post(API_URL, {
                "action": action,
                "params": params
            }, {
                headers: {
                    "X-Auth": authString
                }
            });
            return response.data;
        } catch(error: any){
            console.log(error);
            
        }
    }

    public async getFields (){
        return await this.call(EAction.get_fileds, {field: "brand"})
    }

    public async getProducts(action: EAction,  params?: any){
        return await this.call(action, params)
    }

    public async getProductsByBrandFilter(brand: string) {
        return await this. call(EAction.filter,  {brand: brand})
    }

    public async getProductsByPriceFilter(price: number) {
        return await this. call(EAction.filter, {price: price})
    }

    public async getProductByProductFilter (product: string) {
        return await this. call(EAction.filter, {product: product})
    }
}


export const axiosApiClient = new AxiosApiClient()

