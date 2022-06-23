import express from "express";
import routes from "./routes/api";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

import { Express } from "express";

const HOST = "localhost";
const PORT = 3000;

export const app: Express = express();

// Express' default query parser is finicky and can return unexpected responses
// The built-in query parser is safer
app.set("query parser", (queryString: any) => new URLSearchParams(queryString));
app.use(express.json());
app.use(cors());

app.use("/", routes);
app.use(errorHandler);

try {
  app.listen(PORT, (): void => {
    console.info(`Server listening on port ${PORT}`);
  });
} catch (error: any) {
  console.error(error);
}
