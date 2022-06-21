import { twitterAPIService } from "./twitterStreamAPI";
import { reconnectStream } from "./reconnect";
import { axiosHttpClientEnv } from "../utils/axiosUtils";
import { assign, createMachine, DoneInvokeEvent, interpret } from "xstate";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { TypeOf } from "io-ts";

const getStreamConnection = () =>
  pipe(
    twitterAPIService(axiosHttpClientEnv).connectToTweetStream,
    TE.orElse(reconnectStream)
  )();

type StreamMachineContext = {
  stream: Awaited<ReturnType<typeof getStreamConnection>> | null;
};

type StreamMachineEvents = { type: "START_STREAM" };

const streamMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBcDuBLZywCcC0syOYAhgLYB06EANmAMQDKAKgIIBKzA+i+wKKsAsolAAHAPaxM6cQDsRIAB6I8AFgAcAVgoA2AOwBOTaoMBGPQAZzAZh3WANCACeK66YBMFUxZ3uLf-R0tPQBfEMc0TGx8QmJyCgBjOVkwBOR0WSh6CDkwKlkAN3EAazzIrFwCIlJKJNkUtIyoBAyihJJ0uQBtCwBdBQkpTvkkJUQDCwp3VVV3HRM9LW8DHUcXBDxrVWtdHz9TGfV1azMwiIwKmOr44lhxGgKmgGFk1OH6AclpOQVlDZ19BQTnYtjoDqYdGY1ip3HoKJo9CcDhZVJDEZowuEQLJxBA4ApytEqnFKNQ6J8hjIRqA-ng7NoNFt1PoDHpTKYjtCNm51LtfP5ppp2VsziBCZVYjVEq9GpkKd9qWMNrDtAcgvN1O5rD5TAYuZtNDovHsfEELOpzaLxVcSRRbvdHpkXvU3lT5cNfogZtotppNAZVHpZhaPHp9VsdkKERZFubtVqrRciZL4imyAAxEjoGgAV2I7rdo1p7j8FD0bOZM1N82smi5zIoFkNaus1ncxzBOkTUQl10oaaaFBSqAABIQOmAR6YCz8iypzKr1Oj2aiVjpNA5nCpDbpERMY7qzOzTN3LsSpQO5aNBgrPRtD14l7WV5CARv9R4DLvrOoj7q9H6RinsmfYzoqtKQqYQIrK2qLgpB+qzF+3j8sYByqKYWyhJiQA */
  createMachine(
    {
      context: { stream: null },
      tsTypes: {} as import("./streamService.typegen").Typegen0,
      schema: {
        context: {} as StreamMachineContext,
        events: {} as StreamMachineEvents,
        services: {} as {
          getStreamConnection: {
            data: Awaited<ReturnType<typeof getStreamConnection>>;
          };
        },
      },
      id: "twitter-stream",
      initial: "idle",
      states: {
        idle: {
          on: {
            START_STREAM: {
              target: "connecting",
            },
          },
        },
        connecting: {
          invoke: {
            src: "getStreamConnection",
            onDone: [
              {
                actions: "assignStreamToContext",
                target: "resolvingConnection",
              },
            ],
          },
        },
        resolvingConnection: {
          always: [
            {
              cond: "streamIsConnected",
              target: "streaming",
            },
            {
              cond: "streamIsNotConnected",
              target: "streamFailure",
            },
          ],
        },
        streamFailure: {},
        streaming: {
          initial: "new state 1",
          states: {
            "new state 1": {},
          },
        },
      },
    },
    {
      services: {
        getStreamConnection,
      },
      actions: {
        assignStreamToContext: (context, event) =>
          assign({ stream: event.data }),
      },

      guards: {
        streamIsConnected: (context, _) =>
          context.stream ? E.isRight(context.stream) : false,
        streamIsNotConnected: (context, _) =>
          context.stream ? E.isLeft(context.stream) : false,
      },
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
