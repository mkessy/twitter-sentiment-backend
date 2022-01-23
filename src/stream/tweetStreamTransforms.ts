import { Stream, pipeline, Transform } from "stream";
import * as E from "fp-ts/Either";
import * as D from "io-ts/Decoder";

type HeartBeat = "hb";
type JSONObject = any;

export const parseToJson = new Transform({
  objectMode: true,
  transform(chunk, endcoding, callback) {
    callback(null, JSON.stringify(tryParseChunkToJson(chunk)));
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
const tryParseChunkToJson = (chunk: any): E.Either<HeartBeat, JSONObject> => {
  try {
    const parsedChunk: JSONObject = JSON.parse(chunk);
    return E.right(parsedChunk);
  } catch (e) {
    return E.left("hb");
  }
};
