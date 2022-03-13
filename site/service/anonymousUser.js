const axios = require("axios");
import { HOST_NAME } from "@vercel/commerce-local/environment";
const host = `${HOST_NAME}/api/backend`;

export const saveUserSession = (body) => {
    return new Promise((resolve, reject) => {
            const headers = { 
                'Authorization': 'Bearer my-token',
            };
            axios.post(`${HOST_NAME}/api/backend/saveAnonymousUserSession`, body ,{ headers })
                .then((response) => resolve(response))
                .catch((err)=> reject(err));
    })
}