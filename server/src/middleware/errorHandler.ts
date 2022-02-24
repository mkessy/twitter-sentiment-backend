import { Request, Response, NextFunction } from "express";
import { NewError } from "../Error/Error";
import { sendErrorResponse } from "../utils/sendErrorResponse";

export const errorHandler = (
  error: NewError,
  req: Request,
  res: Response,
  next: NextFunction
) => sendErrorResponse(error, res);
