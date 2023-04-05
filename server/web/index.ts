import express from "express";
import Logger from "../logger";
import ApiRouter from "./apiRouter";

const app = express();

app.use((req, res, next) => {
  // console.log(`${req.method} Request from ${req.headers["x-forwarded-for"]} to ${req.path}`);
  next();
});

app.use("/api", ApiRouter);

app.listen(parseInt(process.env.PORT || "3000"), () => {
  Logger.log("WebServer", `Server is listening on port ${process.env.PORT}`);
});
