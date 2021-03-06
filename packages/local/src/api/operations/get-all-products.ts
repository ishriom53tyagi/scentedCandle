import { Product } from '@vercel/commerce/types/product'
import { GetAllProductsOperation } from '@vercel/commerce/types/product'
import type { OperationContext } from '@vercel/commerce/api/operations'
import type { LocalConfig, Provider } from '../index'
import data from '../../data.json'
const axios = require("axios");
import  host from '../../serverConfiguration.json'

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

      const headers = { 
        'Authorization': 'Bearer my-token',
    };
   let result =  await axios.get(`${host.HOST_NAME}/api/backend/getAllProducts`, { headers, params: variables });
   result =  result.data.data.products;
    // return {
    //   products: data.products,
    // }
    return {
      products: result,
    }
  }
  return getAllProducts
}
