import axios from "axios";

const axiosAPIInstance = axios.create({ 
    baseURL: 'https://victum.eastus.cloudapp.azure.com:3210/orbnote/victum/api/v1',
    headers: { 
        "Accept": "application/json", 
        "Content-Type": "application/json; charset=utf-8; multipart/form-data"
    }
});

const Fetcher = async (args) => {
    console.log("🚀 🚀 🚀 🚀 ~ ~ ~ :", JSON.stringify(args, null, 3))
    let response = {};
    try { 
        response = await axiosAPIInstance(args);
    } catch (error) {
        console.log("🚀 ~ file: Petition.js:11 ~ Fetcher ~ error:", error)
        response = error
        if (error.response) response = error.response;
        else if (error.request) response = error.request;
        else response = error.message;
    } finally { 
        return response; 
    }
}

export default Fetcher;