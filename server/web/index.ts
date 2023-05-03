import express from "express";
import Logger from "../../utils/logger";
import ApiRouter from "./apiRouter";
import path from "path";

const app = express();

app.use((req, res, next) => {
  // console.log(`${req.method} Request from ${req.headers["x-forwarded-for"]} to ${req.path}`);
  next();
});

app.use("/api", ApiRouter);

app.get("/assets/bundle.js", (req, res) => {
  res.sendFile(path.resolve("./dist/bundle.js"));
});

app.get("/assets/styles.css", (req, res) => {
  res.sendFile(path.resolve("./assets/web/css/global.css"));
});

app.listen(parseInt(process.env.PORT || "3000"), () => {
  Logger.log("WebServer", `Server is listening on port ${process.env.PORT}`);
});

// website

app.get("*", (req, res) => {
  res.sendFile(path.resolve("./assets/web/index.html"));
});
