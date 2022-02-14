import { getPostData } from './common';

export const UserSignUp = async (email,firstName,lastName,password) => {
    const url = "/signUp";
    const data = {
        email: email,
        firstName:firstName,
        lastName:lastName,
        password:password
    }
   try {
    const response = await getPostData(url,data);
    return response;
   }
   catch(e) {
       return "Error occusre";
   }
}