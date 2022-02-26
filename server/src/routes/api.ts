import { Request, Response, Router } from "express";

const router = Router();

router.get("/healthcheck", (req: Request, res: Response) =>
  res.status(200).send({ success: true })
);

export default router;
