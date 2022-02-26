import * as D from "io-ts/Decoder";

export const TweetDecoder = D.partial({
  data: D.struct({
    id: D.string,
    text: D.string,
  }),
  matching_rules: D.array(
    D.struct({
      id: D.string,
      tag: D.string,
    })
  ),
});

export const LambdaPayloadDecoder = D.struct({
  ruleId: D.string,
  tweets: D.array(TweetDecoder),
});
