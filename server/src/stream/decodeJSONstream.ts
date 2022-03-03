import * as D from "io-ts/Decoder";

// possible stream object types
// see for reference: https://developer.twitter.com/en/docs/twitter-api/v1/tweets/filter-realtime/guides/streaming-message-types

// limit notices
const limitNoticeDecoder = D.struct({
  limit: D.struct({
    track: D.number,
  }),
});

// disconnect message
const disconnectMessageDecoder = D.struct({
  disconnect: D.struct({
    code: D.number,
    stream_name: D.string,
    reason: D.string,
  }),
});
