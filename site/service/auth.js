import { getPostData } from './common';

export const UserSignUp = () => {
    const url = "/signUp";
    const data = {
        email: "sarthak@gmail.com",
        password: "sarthak123"
    }
    getPostData(url,data).then((response) => {
        console.log("Response after post data",response);
    }).catch((err) => {
        console.log("Error updating ",err);
    })
}