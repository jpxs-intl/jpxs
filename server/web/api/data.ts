import { Router, json } from "express";
import ServerDatabaseManager from "../../database/serverDatabaseManager";
import Logger from "../../logger";
import IncomingDataManager from "../../database/incomingDataManager";

const router = Router();
router.use(json());

router.post("/ping", async (req, res) => {
   IncomingDataManager.handlePingRequest(req.body);
  res.json({ status: "ok" });
});

router.post("/init", async (req, res) => {
  const server = await ServerDatabaseManager.instance.getServerByIpAndPort(req.body.ip, req.body.port);

  if (!server) {
    res.json({
      status: "ok",
      serverId: ServerDatabaseManager.instance.createTempServer(req.socket.remoteAddress || req.headers["x-forwarded-for"] as string || req.ip, req.body.port, req.body.name),
    });
    return;
  }

  Logger.log("DataRouter", `Server ${server.id} initialized. IP: ${server.address}:${server.port} Name: ${req.body.name}`)
  IncomingDataManager.handleInitRequest(req.body, server.id);
  res.json({ status: "ok", serverId: server?.id });
});

router.post("/join", async (req, res) => {
  IncomingDataManager.handleJoinRequest(req.body);
  res.json({ status: "ok" });
});

export default router;
