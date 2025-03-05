import express from "express";
import { Cron } from "croner";
import { setupRoutes } from "./routes";
import { client } from "./db";
import { apiKeyMiddleware, auth0Middleware } from "./auth";
import { NodeConnector } from "./node-connector";
import { placeUnscheduledZones } from "./scheduler";

const prisma = client;
const app = express();
const port = 3000;

const apiKeyPrefix = "hyp_";

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello world! This is a change!");
});

const nodeConnector = new NodeConnector();

setupRoutes({
  app,
  auth0Middleware: auth0Middleware(),
  apiKeyMiddleware: apiKeyMiddleware(apiKeyPrefix, prisma),
  prisma,
  apiKeyPrefix,
  nodeConnector,
});

const schedulerJob = new Cron("*/30 * * * * *", async () => {
  console.log("---Starting to place unscheduled zones---");
  await placeUnscheduledZones({
    prisma,
    nodeConnector,
  });
  console.log("---Finished placing unscheduled zones---");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
