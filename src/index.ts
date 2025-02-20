import express from "express";
import { GetVerificationKey, expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import { setupRoutes } from "./routes";

const app = express();
const port = 3000;

const auth0Middleware = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as unknown as GetVerificationKey,
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_DOMAIN,
  algorithms: ["RS256"],
});

app.get("/", async (req, res) => {
  res.send("Hello world! This is a change!");
});

setupRoutes(app, auth0Middleware);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
