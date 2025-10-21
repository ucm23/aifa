



import axios from "axios";

const axiosAPIInstance = axios.create({
    //baseURL: 'http://172.147.0.1/api/',
    baseURL: 'https://api.conectaifa.com.mx/api/',
    // ACerSIsauTa
    // AifaCtiP085

    //usuario: ajoloapan_pachuca@aifapass-e.com Contraseña: Password6
    //usuario: pachuca@aifapass-e.com Contraseña: Password6
    //usuario: tulancingo_pachuca@aifapass-e.com  Contraseña: Password6

    //baseURL: 'https://sandbox.aifapass-e.com/api/',
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json; charset=utf-8; multipart/form-data"
        //"Content-Type": "application/json"
    }
});

const Fetcher = async (args, token = null) => {
    //console.log("🚀 🚀 🚀 🚀 ~ ~ ~ :", JSON.stringify(args, null, 3))
    let response = {};
    let headers = { ...args.headers };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        //response = await axiosAPIInstance(args);
        response = await axiosAPIInstance({
            ...args,
            headers
        });
    } catch (error) {
        //console.log("🚀 ~ file: Petition.js:11 ~ Fetcher ~ error:", error)
        response = error
        if (error.response) response = error.response;
        else if (error.request) response = error.request;
        else response = error.message;
    } finally {
        return response;
    }
}

export default Fetcher;