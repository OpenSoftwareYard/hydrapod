import express from "express";
import { setupRoutes } from "./routes";
import { client } from "./db";
import { apiKeyMiddleware, auth0Middleware } from "./auth";

const prisma = client;
const app = express();
const port = 3000;

const apiKeyPrefix = "hyp_";

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello world! This is a change!");
});

setupRoutes({
  app,
  auth0Middleware: auth0Middleware(),
  apiKeyMiddleware: apiKeyMiddleware(apiKeyPrefix, prisma),
  prisma,
  apiKeyPrefix,
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
