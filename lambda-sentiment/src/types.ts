import * as D from "io-ts/Decoder";
import { TweetDecoder, LambdaPayloadDecoder } from "./handlers/decoder";

export type Tweet = D.TypeOf<typeof TweetDecoder>;
export type LambdaPayload = D.TypeOf<typeof LambdaPayloadDecoder>;
export interface SentimentPayload {}
