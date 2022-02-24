import { Request, Response, Router } from "express";

const router = Router();

router.get("/healthcheck", (req: Request, res: Response) =>
  res.status(200).send({ success: true })
);

// TODO
// expects stream name in body (a string between 5 and 10 characters)
router.post("/stream/create", (req: Request, res: Response) =>
  res.status(201).send({ success: true })
);

// TODO
// get info (rules, status etc) for given streamid
router.get("/stream/:streamId", (req: Request, res: Response) =>
  res.status(201).send({ success: true })
);

// TODO
// ADD RULES to given streamId
// expects rules in body
router.patch("/stream/rules/add/:streamId", (req: Request, res: Response) =>
  res.status(201).send({ success: true })
);

// TODO
// DELETE RULES to given streamId
// expects rules ID in body
router.patch("/stream/rules/delete/:streamId", (req: Request, res: Response) =>
  res.status(201).send({ success: true })
);

export default router;
