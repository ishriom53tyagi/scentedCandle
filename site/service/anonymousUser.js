const axios = require("axios");
const HOST_NAME = "http://localhost:5120"
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