import { Product } from '@vercel/commerce/types/product'
import { GetAllProductsOperation } from '@vercel/commerce/types/product'
import type { OperationContext } from '@vercel/commerce/api/operations'
import type { LocalConfig, Provider } from '../index'
import data from '../../data.json'
const axios = require("axios");

export default function getAllProductsOperation({
  commerce,
}: OperationContext<any>) {
  async function getAllProducts<T extends GetAllProductsOperation>({
    query = '',
    variables,
    config,
  }: {
    query?: string
    variables?: T['variables']
    config?: Partial<LocalConfig>
    preview?: boolean
  } = {}): Promise<{ products: Product[] | any[] }> {


const host = "http://localhost:5120/api/backend";
      const headers = { 
        'Authorization': 'Bearer my-token',
    };

   let result =  await axios.get("http://localhost:5120/api/backend/getAllProducts", { headers });
   result =  result.data.data;
   console.log("data value is here for axios" ,result);
    // // Create or update the cart cookie
    // res.setHeader(
    //   'Set-Cookie',
    //   getCartCookie(config.cartCookie, data.id, config.cartCookieMaxAge)
    // )
    // res.status(200).json({ data: normalizeCart(data) })
    
    return {
      products: data.products,
    }
  }
  return getAllProducts
}
