import { AddRulesDecoder, DeleteRulesDecoder } from "../decoders";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../Error/Error";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";
import { pipe, flow } from "fp-ts/lib/function";
import { sequenceT, sequenceS } from "fp-ts/lib/Apply";
import { AddRule } from "../types";
import { sendErrorResponse } from "../utils/sendErrorResponse";

const parseDryRunQueryParam = E.fromPredicate(
  (param) => param === "true" || param === "false",
  (invalidParam) =>
    RA.of(`Query parameter must be string boolean. Got: ${invalidParam}`)
);

export const validateAddRulesRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = req.query as unknown as URLSearchParams;
  const dryRun: string = query.has("dry_run") ? query.get("dry_run")! : "false";

  const parseReqBody = flow(
    AddRulesDecoder.decode,
    E.mapLeft((e) => RA.of("Error parsing Request Body. Invalid Request Body"))
  );
  const validation = E.getApplicativeValidation(RA.getSemigroup<string>());
  const validateRequestStruct = sequenceS(validation);

  pipe(
    validateRequestStruct({
      dryRun: parseDryRunQueryParam(dryRun),
      body: parseReqBody(req.body),
    }),
    E.foldW(
      (errors) => next(BadRequestError.of(errors.join("\n"))),
      (validatedAddRulesRequest) => {
        res.locals.validatedAddRulesRequest = validatedAddRulesRequest;
        return next();
      }
    )
  );
};

export const validateDeleteRulesRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = req.query as unknown as URLSearchParams;
  const dryRun: string = query.has("dry_run") ? query.get("dry_run")! : "false";

  const parseReqBody = flow(
    DeleteRulesDecoder.decode,
    E.mapLeft((e) => RA.of("Error parsing request body. Invalid Request Body"))
  );

  const validation = E.getApplicativeValidation(RA.getSemigroup<string>());
  const validateRequestStruct = sequenceS(validation);

  pipe(
    validateRequestStruct({
      dryRun: parseDryRunQueryParam(dryRun),
      body: parseReqBody(req.body),
    }),
    E.foldW(
      (errors) => next(BadRequestError.of(errors.join("\n"))),
      (validatedDeleteRulesRequest) => {
        res.locals.validatedDeleteRulesRequest = validatedDeleteRulesRequest;
        return next();
      }
    )
  );
};
