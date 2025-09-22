import axios from "axios";
import { getAuthToken, resetAuthToken } from "./authorizationToken.js";

export const getSFAccount = async (req, res) => {

    var accountId;
    const { fullName, lastSignedInAt, createdAt, clerkId, clerkEmailId } = req.body;
    console.error(`
        -
        -
        -
        -
        -
        User sync req body
        -
        -
        -
        -
        -
        ${JSON.stringify(req.body)}`);
    if (!fullName || !lastSignedInAt || !createdAt || !clerkId || !clerkEmailId) {
        res.status(400).json({ message: "Please provide all required query params" });
    }
    const queryString = `SELECT ID, Name FROM Account WHERE Clerk_User_Id__c = '${clerkId}' AND Email_Id__c = '${clerkEmailId}' LIMIT 1`;
    try {
        const { authToken, instanceURL } = await getAuthToken();
        if (!authToken || !instanceURL) {
            return res.status(400).json({ message: "Please provide authtoken" });
        }
        const fetchedAccount = await axios.get(
            `${instanceURL}/services/data/v61.0/query?q=${queryString}`,
            {
                headers: {
                    "Authorization": `OAuth ${authToken}`
                }
            }
        );
        console.log(`Fetched Account 1st time = ${JSON.stringify(fetchedAccount.data)} + ${fetchedAccount.status}`);
        // check if any account is present or not against the clerk id
        if (fetchedAccount.data.records.length > 0) {
            accountId = fetchedAccount.data.records[0].Id;
        } else {
            const createdAccount = await axios.post(
                `${instanceURL}/services/data/v56.0/sobjects/Account/`,
                {
                    Name: fullName,
                    Clerk_User_Id__c: clerkId,
                    Email_Id__c: clerkEmailId,
                    To_Do_Clerk_Account_Created_On__c: createdAt,
                    To_Do_Last_Signed_In_On__c: lastSignedInAt
                },
                {
                    headers: {
                        "Authorization": `OAuth ${authToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            console.log(`Created Account 1st time = ${JSON.stringify(createdAccount.data)} + ${createdAccount.status}`);
            accountId = createdAccount.data.id;
        }
        res.json({ accountId });

    } catch (error) {
        if (
            error.response &&
            error.response.status === 401 &&
            error.response.data &&
            error.response.data[0]?.errorCode === "INVALID_SESSION_ID"
        ) {
            console.warn("🔄 Token expired, refreshing...");
            resetAuthToken(); // clear cache
            const { authToken, instanceURL } = await getAuthToken();

            const retryFetchResponse = await axios.get(
                `${instanceURL}/services/data/v61.0/query?q=${queryString}`,
                {
                    headers: {
                        "Authorization": `OAuth ${authToken}`
                    }
                }
            );
            console.log(`Fetched Account error time = ${JSON.stringify(retryFetchResponse.data)} + ${retryFetchResponse.status}`);
            // check if any account is present or not against the clerk id
            if (retryFetchResponse.data.records.length > 0) {
                accountId = retryFetchResponse.data.records[0].Id;
            } else {
                const retrycreatedAccount = await axios.post(
                    `${instanceURL}/services/data/v56.0/sobjects/Account/`,
                    {
                        Name: fullName,
                        Clerk_User_Id__c: clerkId,
                        Email_Id__c: clerkEmailId,
                        To_Do_Clerk_Account_Created_On__c: createdAt,
                        To_Do_Last_Signed_In_On__c: lastSignedInAt
                    },
                    {
                        headers: {
                            "Authorization": `OAuth ${authToken}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                console.log(`Created Account error time = ${JSON.stringify(retrycreatedAccount.data)} + ${retrycreatedAccount.status}`);
                accountId = retrycreatedAccount.data.id;
            }
            res.json({ accountId });
        } else {
            console.error(`Error ${error.message}`);
            res.status(500).json(error.response?.data || { error: error.message });
        }
    }
}