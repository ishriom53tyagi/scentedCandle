import data from '../../data.json'
const axios = require("axios");
import  host from '../../serverConfiguration.json'

export type GetAllProductPathsResult = {
  products: Array<{ path: string }>
}

export default function getAllProductPathsOperation() {
  async function getAllProductPaths(): Promise<GetAllProductPathsResult> {
    const headers = { 
      'Authorization': 'Bearer my-token' };
    let result =  await axios.get(`${host.HOST_NAME}/api/backend/getAllProducts`, { headers });
    result =  result.data.data;
    return Promise.resolve({
   
      products: result.products.map(({ path }:any) => ({ path })),
    })
  }

  return getAllProductPaths
}

//"http://54.211.18.165:5120"