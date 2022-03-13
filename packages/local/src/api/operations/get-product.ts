import type { LocalConfig } from '../index'
import { Product } from '@vercel/commerce/types/product'
import { GetProductOperation } from '@vercel/commerce/types/product'
import data from '../../data.json'
import type { OperationContext } from '@vercel/commerce/api/operations'
import { HOST_NAME } from '../../../environment'

const axios = require("axios");

export default function getProductOperation({
  commerce,
}: OperationContext<any>) {
  async function getProduct<T extends GetProductOperation>({
    query = '',
    variables,
    config,
  }: {
    query?: string
    variables?: T['variables']
    config?: Partial<LocalConfig>
    preview?: boolean
  } = {}): Promise<Product | {} | any> {
    const headers = { 
      'Authorization': 'Bearer my-token' };
    let result =  await axios.get(`${HOST_NAME}/api/backend/getAllProducts`, { headers });
    result =  result.data.data;
    // return {
    //   product: data.products.find(({ slug }) => slug === variables!.slug),
    // }

    return {
      product: result.products.find(({ slug } : any ) => slug === variables!.slug)
    }
  }
  return getProduct
}
