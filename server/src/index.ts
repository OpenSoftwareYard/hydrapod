import express from "express";
import { Cron } from "croner";
import { setupRoutes } from "./routes";
import { client } from "./db";
import { apiKeyMiddleware, auth0Middleware } from "./auth";
import { NodeConnector } from "./node-connector";
import { placeUnscheduledZones } from "./scheduler";
import { checkZoneStatuses } from "./zone-status-checker";
import cors from "cors";
import fs from "fs";
import https from "https";
import { nodeMonitor } from "./node-monitor";

const prisma = client;
const app = express();
const port = 3001;

const apiKeyPrefix = "hyp_";
app.use(express.json());
app.use(cors());

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

// Cron job to check the status of zones and update the database
// Runs every minute
const nodeMonitorJob = new Cron("0 * * * * *", async () => {
  console.log("---Starting node monitor---");
  await nodeMonitor({
    prisma,
    nodeConnector,
  });
  console.log("---Finished node monitor---");
});

const httpsOptions = {
  key: fs.readFileSync("./security/key.pem"),
  cert: fs.readFileSync("./security/cert.pem"),
};

const server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
