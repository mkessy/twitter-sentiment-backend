import { Stream, pipeline, Transform } from "stream";
import * as E from "fp-ts/Either";
import * as D from "io-ts/Decoder";
import { string } from "fp-ts";

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

export const decodeTransformStream = <A>(decoder: D.Decoder<unknown, A>) => {
  return new Transform({
    objectMode: true,
    transform(jsonObject, endcoding, callback) {
      callback(null, decoder.decode(jsonObject));
    },
  });
};

// if it can't be parsed to JSON assume it is a heartbeat
const tryParseChunkToJson = E.tryCatchK(
  (chunk: string) => JSON.parse(chunk),
  (e) => "hb" as HeartBeat
);
