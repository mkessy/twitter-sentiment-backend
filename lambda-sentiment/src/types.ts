import * as D from "io-ts/Decoder";
import { TweetDecoder, LambdaPayloadDecoder } from "./handlers/decoder";
import { google } from "@google-cloud/language/build/protos/protos";

export type Tweet = D.TypeOf<typeof TweetDecoder>;
export type LambdaPayload = D.TypeOf<typeof LambdaPayloadDecoder>;
export interface SentimentPayload {}
export type SentimentDataPoint = {
  ruleId: string;
  timestamp: string;
  tweets: Tweet[];
  sentiment: google.cloud.language.v1.IAnalyzeSentimentResponse;
};
