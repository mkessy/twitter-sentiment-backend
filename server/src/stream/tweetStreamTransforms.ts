import { Stream, pipeline, Transform, Writable } from "stream";
import * as E from "fp-ts/Either";
import * as D from "io-ts/Decoder";
import { string } from "fp-ts";
import { pipe } from "fp-ts/lib/function";

type HeartBeat = "hb";
type JSONObject = any;

// if it can't be parsed to JSON assume it is a heartbeat
export const tryParseChunkToJson = (chunk: any) => {
  try {
    const parsedChunk = JSON.parse(chunk);
    return parsedChunk;
  } catch (error) {
    return "hb";
  }
};
