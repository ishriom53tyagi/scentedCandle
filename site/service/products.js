import { getData } from './common';

export const getAllProducts = async () => {
    const url = "/getAllProducts";
   try {
    const response = await getData(url);
    return response;
   }
   catch(e) {
       return "Error occurs";
   }
}