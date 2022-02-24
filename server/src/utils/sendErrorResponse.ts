import { Response } from "express";
import { ErrorType, NewError } from "../Error/Error";

export function sendErrorResponse(error: NewError, res: Response) {
  // since all our errors are tagged we could extend
  // functionality to do something different depending on error type

  switch (error._tag) {
    case ErrorType.BadRequestError:
      return res.status(400).send({ error: error.message });
    case ErrorType.NetworkError:
      return res.status(400).send({ error: error.message });
    case ErrorType.ParseError:
      return res.status(400).send({ error: error.message });
    default:
      // by default just send an Internal Server Error
      return res.status(500).send({ error: error.message });
  }
}
