// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    assignStreamToContext: "done.invoke.twitter-stream.connecting:invocation[0]";
  };
  internalEvents: {
    "done.invoke.twitter-stream.connecting:invocation[0]": {
      type: "done.invoke.twitter-stream.connecting:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "": { type: "" };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getStreamConnection: "done.invoke.twitter-stream.connecting:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    getStreamConnection: "START_STREAM";
  };
  eventsCausingGuards: {
    streamIsConnected: "";
    streamIsNotConnected: "";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "idle"
    | "connecting"
    | "resolvingConnection"
    | "streamFailure"
    | "streaming"
    | "streaming.new state 1"
    | { streaming?: "new state 1" };
  tags: never;
}
