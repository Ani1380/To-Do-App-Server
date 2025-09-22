import axios from "axios";
import { getAuthToken, resetAuthToken } from './authorizationToken.js';

export const getToDoList = async (req, res) => {

    const { accountId } = req.query;
    if(!accountId){
        res.status(400).json({ message : "Account ID is missing"});
    }
    try {
        const { authToken, instanceURL } = await getAuthToken();
        if (!authToken || !instanceURL) {
            return res.status(400).json({ message: "Please provide authtoken" });
        }
        const response = await axios.get(
            `${instanceURL}/services/data/v61.0/query?q=SELECT ID,
                                                               Name,
                                                               Title__c,
                                                               Description__c,
                                                               Due_Date__c,
                                                               Is_Completed__c,
                                                               Priority__c,
                                                               Account__c 
                                                         FROM To_Do__c 
                                                         WHERE Account__c = '${accountId}'
                                                         ORDER BY Due_Date__c ASC`,
            {
                headers: { "Authorization": `OAuth ${authToken}` }
            }
        )
        // console.log(`get list URI = ${JSON.stringify(response.data)}`);
        res.json(response.data);
    }
    catch (error) {
        console.error(`Error ${error.message}`);
        if (
            error.response &&
            error.response.data &&
            error.response.data[0]?.errorCode === "INVALID_SESSION_ID"
        ) {
            console.warn("🔄 Token expired, refreshing...");
            resetAuthToken(); // clear cache
            const { authToken, instanceURL } = await getAuthToken();

            const retryResponse = await axios.get(
                `${instanceURL}/services/data/v61.0/query?q=SELECT ID,
                                                               Name,
                                                               Title__c,
                                                               Description__c,
                                                               Due_Date__c,
                                                               Is_Completed__c,
                                                               Priority__c,
                                                               Account__c 
                                                         FROM To_Do__c 
                                                         WHERE Account__c = '${accountId}'
                                                         ORDER BY Due_Date__c ASC`,
                {
                    headers: { "Authorization": `OAuth ${authToken}` }
                }
            )
            // console.log(`get list retry URI = ${JSON.stringify(retryResponse.data)}`);
            res.json(retryResponse.data);
        } else {
            res.status(500).json(error.response?.data || { error: error.message });
        }
    }
}

export const createToDoList = async (req, res) => {

    try {
        const { authToken, instanceURL } = await getAuthToken();
        if (!authToken || !instanceURL) {
            return res.status(400).json({ message: "Please provide authtoken" });
        }
        const response = await axios.post(
            `${instanceURL}/services/data/v56.0/sobjects/To_Do__c/`,
            req.body,
            {
                headers: { "Authorization": `OAuth ${authToken}` }
            }
        )
        // console.log(`create list URI = ${JSON.stringify(response.data)}`);
        res.json(response.data);
    }
    catch (error) {
        if (
            error.response &&
            error.response.data &&
            error.response.data[0]?.errorCode === "INVALID_SESSION_ID"
        ) {
            console.warn("🔄 Token expired, refreshing...");
            resetAuthToken(); // clear cache
            const { authToken, instanceURL } = await getAuthToken();

            const retryResponse = await axios.post(
                `${instanceURL}/services/data/v56.0/sobjects/To_Do__c/`,
                req.body,
                {
                    headers: { "Authorization": `OAuth ${authToken}` }
                }
            )
            // console.log(`create list retry URI = ${JSON.stringify(retryResponse.data)}`);
            res.json(retryResponse.data);
        } else {
            console.error(`Error ${error.message}`);
            res.status(500).json(error.response?.data || { error: error.message });
        }
    }
}

export const deleteToDoList = async (req, res) => {

    const { todoId } = req.query;
    if (!todoId) {
        return res.status(400).json({ message: "Please provide valid todo ID" });
    }

    try {
        const { authToken, instanceURL } = await getAuthToken();
        if (!authToken || !instanceURL) {
            return res.status(400).json({ message: "Please provide authtoken" });
        }

        const response = await axios.delete(
            `${instanceURL}/services/data/v56.0/sobjects/To_Do__c/${todoId}`,
            {
                headers: { "Authorization": `OAuth ${authToken}` }
            }
        )
        // console.log(`delete list URI = ${JSON.stringify(response.data)}`);
        res.status(204).send();
    } catch (error) {
        if (
            error.response &&
            error.response.data &&
            error.response.data[0]?.errorCode === "INVALID_SESSION_ID"
        ) {
            console.warn("🔄 Token expired, refreshing...");
            resetAuthToken(); // clear cache
            const { authToken, instanceURL } = await getAuthToken();

            const retryResponse = await axios.delete(
                `${instanceURL}/services/data/v56.0/sobjects/To_Do__c/${todoId}`,
                {
                    headers: { "Authorization": `OAuth ${authToken}` }
                }
            )
            // console.log(`delete list retry URI = ${JSON.stringify(retryResponse.data)}`);
            res.status(204).send();
        } else {
            console.error(`Error ${error.message}`);
            res.status(500).json(error.response?.data || { error: error.message });
        }
    }
}