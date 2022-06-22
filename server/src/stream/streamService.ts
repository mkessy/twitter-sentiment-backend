import { twitterAPIService } from "./twitterStreamAPI";
import { reconnectStream } from "./reconnect";
import { axiosHttpClientEnv } from "../utils/axiosUtils";
import { assign, createMachine } from "xstate";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { NewError } from "../Error/Error";
import { processTweetStream, tearDownStream } from "./processStream";

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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcDuBLZywCcC0syOYAhgLYB06EANmAMQDKAKgEoCiAggLID6LnVs0SgADgHtYmdOIB2IkAA9EeAGwAWAOwUATOtUAGAJxHN6owEYAzJosAaEAE8VADlUBWXe52aX6-f42OgC+wQ5omNj4hMTkFADGcrJg8cjoslBMbFx8AMIA8gByhey5zLwAYpwAkgAyAKocChJSaXIKygh4FqpGFAbuBqpW6lZW3sM6Vg7OXW5WFKouBjpGVkbqPrah4RhYuAREpJSJssmp6ZksHDy8BcWl5Yz1ubnsjIzNktLtSEoq7gsLgo7isOmGBi0Rj8fhmKk06woLjGmhWmg2Rl6ITCIAi+2iRziMWOlwoohw4nicCkGWYqDAYGQjEJZCyNz4FWqhWqjAAEuwACJfVoyeR-Tp4EYGCg9CHQyHmHxwrruQEUcYIrSbVbuVTY3aRA7Eoks0nYEg4S4C8SoWTM2Ks645XjMLisAX5ADqhTu+W4AAVauxXcKfmLQBL1AZtJoli5fJo9FYXEZ3OplXhVtKhgjoyNUdHVJodri9lFDg6KMayJd6BA5GAq8gSNgKHjy9Wmw7LqG2uH-l10X0LFoXBYfN4xxsMxoKImEToDNGXCudMjQjjZOIIHAFO2jSyqLQwL3RR1XJC58nVL1VBZxyYdBn49KgQYrAYx-p1ksS-uCZWpznGkGSnr8EYqFG2iplGPRwYCoLPqiMrLB+X7DJiLh-mWB6VtWuRJCkfYVCQ6A0AArsQYH9hKFiYhQJgeFYI5TNGOhKk48L6OqKI9CYLjuKm2GGgBxxdiSGRkhSVKwDSUB0gyTIstR55dB42i6nogLLL4YwZqq2gCQid56h4U7CfiFZidWZqkJaGTWra9rHCp4oAqm6qrOoaYuOxmIWJoGbrAsFiDDYQIjCmK6qBZHaHjZkmJGQoh0NgrkQWpqo8QYPSaAmYK2BmI7qP07GaaM97WD4sW4dZpqgX8LRhqpahjiCereW+unTJxakfki7gInl6jIv5NWieQ6UDngvnAgibi3veqxGE+vV4BsIWoTlsbQuYMUbkAA */
  createMachine(
    {
      context: {},
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
