import express from "express";
import routes from "./routes/api";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

import { Express } from "express";

const HOST = "localhost";
const PORT = 8080;

export const app: Express = express();

// Express' default query parser is finicky and can return unexpected responses
// The built-in query parser is safer
app.set("query parser", (queryString: any) => new URLSearchParams(queryString));
app.use(cors());

app.use("/", routes);
app.use(errorHandler);

try {
  app.listen(PORT, HOST, (): void => {
    console.info(`Server listening at http://${HOST}:${PORT}`);
  });
} catch (error: any) {
  console.error(error);
}
