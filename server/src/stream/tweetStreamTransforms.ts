// if it can't be parsed to JSON assume it is a heartbeat
export const tryParseChunkToJson = (chunk: any) => {
  try {
    const parsedChunk = JSON.parse(chunk);
    return parsedChunk;
  } catch (error) {
    return "hb";
  }
};
