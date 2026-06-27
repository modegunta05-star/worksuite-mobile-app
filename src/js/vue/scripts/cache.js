import moment from 'moment';
import axiosHttp from '../boot/axiosHttp';

const DEFAULT_CACHE_TIME = 3600; // Define default cache time in seconds

export default {
    get(key) {
        const cache = JSON.parse(window.sessionStorage.getItem(key));
        if (cache && moment().isBefore(cache.time)) {
            return cache.data;
        }
        return null;
    },

    httpGet(endpoint) {
        return new Promise((resolve, reject) => {
            const cache = this.get(endpoint);
            if (cache) {
                resolve(cache);
            } else {
                axiosHttp.get(endpoint)
                    .then(response => {
                        this.set(endpoint, response.data, DEFAULT_CACHE_TIME);
                        resolve(response.data);
                    })
                    .catch(error => {
                        reject(error.response.data);
                    });
            }
        });
    },

    set(key, data, time = DEFAULT_CACHE_TIME) {
        const expireTime = moment().add(time, 's');
        try {
            window.sessionStorage.setItem(
                key,
                JSON.stringify({ time: expireTime, data })
            );
        } catch (event) {
            console.error(event);
        }
    },

    clear() {
        try {
            window.sessionStorage.clear();
        } catch (event) {
            console.error(event);
        }
    },

    remove(key) {
        try {
            window.sessionStorage.removeItem(key);
        } catch (event) {
            console.error(event);
        }
    },

    removeMatching(search) {
        const keysToRemove = [];
        try {
            for (let i = 0; i < window.sessionStorage.length; i++) {
                const key = window.sessionStorage.key(i);
                if (key.startsWith(`/${search}`)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => window.sessionStorage.removeItem(key));
        } catch (event) {
            console.error(event);
        }
    },
};

