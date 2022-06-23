import { twitterAPIService } from "./twitterStreamAPI";
import { reconnectStream } from "./reconnect";
import { axiosHttpClientEnv } from "../utils/axiosUtils";
import { assign, createMachine } from "xstate";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { NewError } from "../Error/Error";
import { processTweetStream, tearDownStream } from "./processStream";
import { finished } from "stream";
import { TweetDecoder } from "../decoders";
import { tryParseChunkToJson } from "./tweetStreamTransforms";

export const getStreamConnection = () =>
  pipe(
    twitterAPIService(axiosHttpClientEnv).connectToTweetStream,
    TE.orElse(reconnectStream)
  )();

type StreamMachineContext = {};
type StreamMachineEvents =
  | { type: "STREAM_START" }
  | { type: "STREAM_CONNECT_SUCCESS" }
  | { type: "STREAM_CONNECT_FAILURE" }
  | { type: "STREAM_FINISHED" }
  | { type: "STREAM_TEARDOWN_COMPLETE" };
export const streamMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBcDuBLZywCcC0syOYAhgLYB06EANmAMQDKAKgEoCiAggLID6LnVs0SgADgHtYmdOIB2IkAA9EeAOwAmAJwVVAFlWqArADYTxgIwAOc+YA0IAJ4rLAZlUVjABk+aLqi+aG6uoAviH2aJjY+ITE5BQAxnKyYAnI6LJQTGxcfADCAPIAckXsecy8AGKcAJIAMgCqHAoSUulyCsoIeOqG5hSGQVo2QS6eGvZO3a7GFJ7qlvrm6i6aupbGYREYWLgERKSUSbIpaRlZLBw8vIUlZRWMDXl57IyMLZLSHUhKKl79nhcugWGl8lk06l0kxUqmWFCsVks3k05mMi1C4RAkV2MQO8Vih3OFFEOHECTgUkyzFQYDAyEYeLI2SufEqNSKNUYAAl2AARD5tGTyH5dPDA9QeYyqXzGYzqQIuWXGaHdUY6TyDSGw3ywjHbKJ7An4xlE7AkHDnXniVCyBlxJmXXK8ZhcVi8goAdSKNwK3AACnV2C6BV9haBRbpNJ4KOpVBqXINdOZdC4gYYVT05RQk4Z1rpjCmNOpZVssTtovt7RQjWRzvQIHIwNXkCRsBRsRWa837ecQ+0w79ptYPJH85oTJoNkCM245kZI6o3INNKpLBjMbJxBA4AoO4bGVRaGA+0LOs5LO5IYDi8DXCn1Bn0QMFutcymbFZS3vcVXjqd0pkJ7fOGKiRtGuiDFKWirsuLiPsCz6LJYb4uB+lhfuW+5VjWeTJKk-aVCQ6A0AArsQQEDqKsbaJG1iWGuuieDYcpQo4MJWB4dFrFohioRhBo-oc3aEpkxKkuSsCUlA1K0vSjIUWe3R6NGngFuYngbJCF6qBmvHRuoGq8eCKxaMYmj8TilZCTWpqkBamRWjadqHApIp-MOEEFpOJhJosOlsd0qEuBQk5rsYbiIuYEIWZ2B42aJSRkKIdDYK5IFKbOrhWJCXiFjYGbMRQbjjKsGirgssYxVh1kmoBPytKGilqAWcxqRpLHaRmXjBQZgxRQZ4VrOYVWCeQaWDngKL9FeLg3gsQKzRmKKGIhtFJpCqK6GEYRAA */
  createMachine(
    {
      context: { stream: null },
      tsTypes: {} as import("./streamService.typegen").Typegen0,
      schema: {
        context: {} as StreamMachineContext,
        events: {} as StreamMachineEvents,
        services: {} as {},
      },
      preserveActionOrder: true,
      id: "twitter-stream",
      initial: "idle",
      states: {
        idle: {
          on: {
            STREAM_START: {
              target: "connecting",
            },
          },
        },
        connecting: {
          on: {
            STREAM_CONNECT_FAILURE: {
              target: "streamConnectionFailure",
            },
            STREAM_CONNECT_SUCCESS: {
              target: "streaming",
            },
          },
        },
        streamConnectionFailure: {},
        streaming: {
          initial: "processingTweetStream",
          states: {
            processingTweetStream: {
              on: {
                STREAM_FINISHED: {
                  target: "tearingDownStream",
                },
              },
            },
            tearingDownStream: {
              on: {
                STREAM_TEARDOWN_COMPLETE: {
                  target: "complete",
                },
              },
            },
            complete: {
              type: "final",
            },
          },
          onDone: {
            target: "idle",
          },
        },
      },
    },
    {
      services: {},
      actions: {},

      guards: {},
    }
  );

// class that has ownership over the tweet stream
// can be subscribed to
// should maintain the only connection instances to the twitter api
/* function createStreamService() {
  return new StreamService();
}

const StreamService = createStreamService();

export default StreamService;
 */
