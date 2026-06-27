import serverless from "serverless-http";
import app from "../../server.js";

const expressApp = app.default || app;

export const handler = serverless(expressApp);
