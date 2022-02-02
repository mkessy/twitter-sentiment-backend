import { CreateTableInput } from "@aws-sdk/client-dynamodb";

export const RULES_TABLE: CreateTableInput = {
  TableName: "RULES",
  KeySchema: [
    {
      AttributeName: "streamId",
      KeyType: "HASH",
    },
  ],
  AttributeDefinitions: [{ AttributeName: "streamId", AttributeType: "S" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10,
  },
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: "NEW_IMAGE",
  },
};

export const SENTIMENT_TABLE: CreateTableInput = {
  TableName: "SENTIMENT",
  KeySchema: [
    {
      AttributeName: "streamId",
      KeyType: "HASH",
    },
    {
      AttributeName: "timestamp",
      KeyType: "RANGE",
    },
  ],
  AttributeDefinitions: [
    { AttributeName: "streamId", AttributeType: "S" },
    { AttributeName: "timestamp", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10,
  },
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: "NEW_IMAGE",
  },
};
