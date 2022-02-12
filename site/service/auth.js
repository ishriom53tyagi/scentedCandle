import { getPostData } from './common';

export const UserSignUp = async () => {
    const url = "/signUp";
    const data = {
        email: "sarthak@gmail.com",
        password: "sarthak123"
    }
   try {
    const response = await getPostData(url,data);
    return response;
   }
   catch(e) {
       return "Error occusre";
   }
}