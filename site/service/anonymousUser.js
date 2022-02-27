const axios = require("axios");
const host = "http://localhost:5120/api/backend";

export const saveUserSession = (body) => {
    return new Promise((resolve, reject) => {
            const headers = { 
                'Authorization': 'Bearer my-token',
            };
            axios.post(`http://localhost:5120/api/backend/saveAnonymousUserSession`, body ,{ headers })
                .then((response) => resolve(response))
                .catch((err)=> reject(err));
    })
}