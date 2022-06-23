import { streamMachine, getStreamConnection } from "./stream/streamService";
import { interpret } from "xstate";
import * as E from "fp-ts/Either";
import "dotenv/config";
import { pipe } from "fp-ts/lib/function";
import { tryParseChunkToJson } from "./stream/tweetStreamTransforms";
import { TweetDecoder } from "./decoders";
import { finished } from "stream";

export const streamService = interpret(streamMachine).start();
export const runStreamService = async () => {
  streamService.send("STREAM_START");
  const stream = await getStreamConnection();
  if (E.isRight(stream)) {
    streamService.send("STREAM_CONNECT_SUCCESS");
    const rawStream = stream.right;

    rawStream.pause();
    // stream processing here
    rawStream.on("data", (data) => {
      pipe(
        tryParseChunkToJson(data),
        TweetDecoder.decode,
        E.foldW(
          (e) => console.log(e),
          (tweet) => console.log(tweet)
        )
      );
    });

    const cleanup = finished(rawStream, (err) => {
      streamService.send("STREAM_FINISHED");
      cleanup();
      streamService.send("STREAM_TEARDOWN_COMPLETE");
    });

    rawStream.resume();
  } else {
    streamService.send("STREAM_CONNECT_FAILURE");
  }

  return stream;
};

/* console.log("Starting with initial state: ");
console.log(streamService.state.value);
streamService.onTransition((state, event) => {
  console.log(`Transition: ${state.value} ---- ${event.type}`);
  console.log(state.context);
});
 */
