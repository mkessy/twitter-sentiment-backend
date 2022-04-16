// controller for handling adding/validating/deleting rules to the stream

import { Response, Request } from "express";
import { twitterAPIService } from "../stream/twitterStreamAPI";
import { axiosHttpClientEnv } from "../utils/axiosUtils";
import { AddRulesDecoder } from "../decoders";
import { pipe } from "fp-ts/lib/function";

export async function handleAddRules = (req: Request, res: Response) => {
  
  const validatedAddRulesRequest = res.locals.validatedAddRulesRequest



};
