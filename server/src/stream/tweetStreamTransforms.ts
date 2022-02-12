import { Stream, pipeline, Transform, Writable } from "stream";
import * as E from "fp-ts/Either";
import * as D from "io-ts/Decoder";
import { string } from "fp-ts";
import { pipe } from "fp-ts/lib/function";

type HeartBeat = "hb";
type JSONObject = any;

export const objectModeStream = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    callback(null, chunk);
  },
});

export const stringifyStream = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    callback(null, JSON.stringify(chunk) + "\n");
  },
});

export const parseToJson = new Transform({
  objectMode: true,
  transform(chunk, endcoding, callback) {
    callback(null, tryParseChunkToJson(chunk));
  },
});

export const logStream = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    callback(null, ((obj) => console.log(obj))(chunk));
  },
});

// TO-DO

export const decodeTransformStream = <A>(decoder: D.Decoder<unknown, A>) => {
  return new Transform({
    objectMode: true,
    transform(chunk, endcoding, callback) {
      const parsed = chunk === "hb" ? chunk : decoder.decode(chunk);
      callback(null, parsed);
    },
  });
};

// if it can't be parsed to JSON assume it is a heartbeat
export const tryParseChunkToJson = (chunk: any) => {
  try {
    const parsedChunk = JSON.parse(chunk);
    return parsedChunk;
  } catch (error) {
    return "hb";
  }
};
