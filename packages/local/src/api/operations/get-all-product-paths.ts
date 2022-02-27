import data from '../../data.json'
const axios = require("axios");
const host = "http://localhost:5120/api/backend";


export type GetAllProductPathsResult = {
  products: Array<{ path: string }>
}

export default function getAllProductPathsOperation() {
  async function getAllProductPaths(): Promise<GetAllProductPathsResult> {
    const headers = { 
      'Authorization': 'Bearer my-token' };
    let result =  await axios.get("http://localhost:5120/api/backend/getAllProducts", { headers });
    result =  result.data.data;
    return Promise.resolve({
   
      products: result.products.map(({ path }:any) => ({ path })),
    })
  }

  return getAllProductPaths
}
