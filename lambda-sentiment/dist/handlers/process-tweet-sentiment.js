"use strict";
// Create clients and set shared const values outside of the handler.
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTweetSentiment = void 0;
const language_1 = require("@google-cloud/language");
// Get the DynamoDB table name from envißronment variables
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const ddbClient = new client_dynamodb_1.DynamoDBClient({ region: "us-west-2" });
const languageClient = new language_1.LanguageServiceClient();
const envVars = process.env;
/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
const processTweetSentiment = async (event, context) => {
    const text = "Arsenal sucks but Mikel Arteta is a good man";
    // Prepares a document, representing the provided text
    const document = {
        content: text,
        type: "PLAIN_TEXT",
    };
    // Detects sentiment of entities in the document
    const [result] = await languageClient.analyzeEntitySentiment({
        document: document,
    });
    console.log(JSON.stringify(result));
    const entities = result.entities;
    return {
        statusCode: 200,
        body: JSON.stringify(entities),
    };
};
exports.processTweetSentiment = processTweetSentiment;
