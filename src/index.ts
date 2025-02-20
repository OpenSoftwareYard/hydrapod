import express from "express";
import { setupRoutes } from "./routes";

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  res.send("Hello world! This is a change!");
});

setupRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
