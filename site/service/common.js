const axios = require("axios");
var uuid = require('uuid');
import { HOST_NAME } from "@vercel/commerce-local/environment";

const host = `${HOST_NAME}/api/backend`;
export const getPostData = (url, body) => {
    return new Promise((resolve, reject) => {
            const headers = { 
                'Authorization': 'Bearer my-token',
            };
            axios.post(`${host}${url}`, body, { headers })
                .then((response) => resolve(response))
                .catch((err)=> reject(err));
    })
}

export const getData = (url) => {
    return new Promise((resolve, reject) => {
            const headers = { 
                'Authorization': 'Bearer my-token',
            };
            axios.get(`${host}${url}`, { headers })
                .then((response) => resolve(response))
                .catch((err)=> reject(err));
    })
}


export const getAnoynmusUserCookie = (url) => {
    return uuid.v4();
}