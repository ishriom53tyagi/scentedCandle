const axios = require("axios");

const host = "http://localhost:5120/api/backend";
export const getPostData = (url, body) => {
    return new Promise((resolve, reject) => {
            const headers = { 
                'Authorization': 'Bearer my-token',
                'My-Custom-Header': 'foobar'
            };
            axios.post(`${host}${url}`, body, { headers })
                .then((response) => resolve(response))
                .catch((err)=> reject(err));
    })
}