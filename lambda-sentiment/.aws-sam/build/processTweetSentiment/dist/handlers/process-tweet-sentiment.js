"use strict";
// Create clients and set shared const values outside of the handler.
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTweetSentiment = void 0;
// Get the DynamoDB table name from environment variables
const envVars = process.env;
/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
const processTweetSentiment = async (event, context) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify(envVars),
    };
    // All log statements are written to CloudWatch
    return response;
};
exports.processTweetSentiment = processTweetSentiment;
