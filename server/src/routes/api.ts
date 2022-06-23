import { NextFunction, Request, Response, Router } from "express";
import { StreamCommandDecoder } from "../decoders";
import { StreamCommand } from "../types";
import { runStreamService, streamService } from "../stream";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import { waitFor } from "xstate/lib/waitFor";
import { waitForDebugger } from "inspector";
import { NewError } from "../Error/Error";

const router = Router();

router.get("/healthcheck", (req: Request, res: Response) =>
  res.status(200).send({ success: true })
);

// route to start and stop the stream

/* 
need to add auth routes here and send 403 without proper auth
{"command": "start" or "stop", ""}

*/
router.post("/stream", async (req: Request, res: Response) => {
  console.log(req.body);
  const reqValid = StreamCommandDecoder.decode({ command: req.body.command });
  let stream: E.Either<NewError, NodeJS.ReadStream> | null = null;

  if (E.isLeft(reqValid)) {
    return res.status(400).send({ message: "Invalid request format" });
  }

  // TODO: implement 'stop' command
  // will probably require refactor of streamServiceApi
  const { command } = reqValid.right;

  // TODO: refactor this entire route
  // responses should be based on product type of "command" + "streamService.state.value"
  if (streamService.state.matches("streamConnectionFailure")) {
    if (command !== "restart") {
      return res.status(200).send({
        success: false,
        status: streamService.state.value,
        message: "Stream experienced failure. Send 'restart' command.",
      });
    } else {
      try {
        stream = await runStreamService();
        await waitFor(streamService, (state) => state.matches("streaming"));
        return res.status(200).send({ success: true, status: "streaming" });
      } catch (error) {
        return res
          .status(200)
          .send({ success: false, error, status: streamService.state.value });
      }
    }
  }

  if (command === "start") {
    if (streamService.state.matches("idle")) {
      try {
        stream = await runStreamService();
        await waitFor(streamService, (state) => state.matches("streaming"));
        return res.status(200).send({ success: true, status: "streaming" });
      } catch (error) {
        return res
          .status(200)
          .send({ success: false, error, status: streamService.state.value });
      }
    } else {
      return res.status(200).send({
        success: false,
        status: streamService.state.value,
        message: "stream already in active state",
      });
    }
  } else if (command === "stop") {
    return res.status(200).send({
      success: false,
      status: streamService.state.value,
      message: "'stop' command not yet implemented",
    });
  }
});

export default router;
