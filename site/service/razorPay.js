import { getPostData } from './common';

export const createOrder = async (data) => {
    const url = "/razorpay/order";
   try {
    const response = await getPostData(url,data);
    return response;
   }
   catch(e) {
       return "Error occurs";
   }
}