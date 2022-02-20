// Create clients and set shared const values outside of the handler.

import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
// Get the DynamoDB table name from environment variables
const envVars = process.env;
// Create a DocumentClient that represents the query to add an item

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
export const processTweetSentiment: ProxyHandler = async (event, context) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(envVars),
  };

  // All log statements are written to CloudWatch

  return response;
};
