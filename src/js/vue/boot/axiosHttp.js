import axios from 'axios';
import {API_URL} from "@/js/vue/config";

const axiosHttp = axios.create({
    baseURL: API_URL, // This will be overwritten in app.vue interceptor
    headers: {
        'Content-type': 'application/json',
    },
});

export default axiosHttp;
