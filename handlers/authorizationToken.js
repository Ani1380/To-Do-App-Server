import dotenv from "dotenv";
import axios from "axios";
import cache from '../middlewares/cachestorage.js';
import { TOKEN_KEY, TOKEN_URL } from '../constants/constants.js';

dotenv.config();

export const getAuthToken = async () => {

    try {
        let authToken = cache.get(TOKEN_KEY);
        let instanceURL = cache.get(TOKEN_URL);

        if (!cache.get(authToken) || !cache.get(instanceURL)) {

            let sfPostparams = new URLSearchParams({
                grant_type: process.env.SF_GRANT_TYPE,
                client_id: process.env.SF_CLIENT_ID,
                client_secret: process.env.SF_CLIENT_SECRET,
                username: process.env.SF_USERNAME,
                password: process.env.SF_PASSWORD
            });
            const response = await axios.post(
                "https://login.salesforce.com/services/oauth2/token",
                sfPostparams,
                {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                }
            );
            // console.log(`AuthToken URI = ${JSON.stringify(response.data)}`);
            cache.put(TOKEN_KEY, response.data.access_token);
            cache.put(TOKEN_URL, response.data.instance_url);

            authToken = response.data.access_token;
            instanceURL = response.data.instance_url;
            // console.log(`AuthToken Details = ${authToken} \n ${instanceURL}`);
        }

        let token = { authToken, instanceURL };
        // console.log(`Token = ${JSON.stringify(token)}`);
        return { authToken, instanceURL };

    } catch (err) {
        return err.message;
    }
}

// clear cache if token fails
export const resetAuthToken = () => {
    cache.del(TOKEN_KEY);
    cache.del(TOKEN_URL);
};
