import express from "express";
import http from "http";
import { Server } from "socket.io";
import Logger from "../../utils/logger";
import ApiRouter from "./apiRouter";
import path from "path";
import { ClientToServerEvents, ServerToClentEvents } from "../../assets/web/scripts/socket/messages";
import SocketHandler from "./socketHandler";

const app = express();
const server = http.createServer(app);
const socketHandler = new SocketHandler()

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

// website

app.get("*", (req, res) => {
  res.sendFile(path.resolve("./assets/web/index.html"));
});

// socket.io

const io = new Server<ClientToServerEvents, ServerToClentEvents>(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  Logger.log("WebServer", `Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    Logger.log("WebServer", `Socket disconnected: ${socket.id}`);
  });

  socketHandler.registerSocket(socket)
});

server.listen(parseInt(process.env.PORT || "3000"), () => {
  Logger.log("WebServer", `Server is listening on port ${process.env.PORT}`);
});
