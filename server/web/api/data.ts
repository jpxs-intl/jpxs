import { Router, json } from "express";
import ServerDatabaseManager from "../../database/serverDatabaseManager";
import Logger from "../../../utils/logger";
import IncomingDataManager from "../../database/incomingDataManager";
import KeyManager from "../../database/keyManager";
import { KeyPerms } from "../../types/keyPerms";
import { Key } from "../../../database/entities/key.entity";

const router = Router();
router.use(json());

router.use(async (req, res, next) => {
  const key = await KeyManager.instance.getKey(req.headers["authorization"] as string);

  if (!key || !key.enabled || !key.hasPermission(KeyPerms.USE_JPXS)) {
    res.json({ status: "error", error: "Invalid Authorization" });
    return;
  }

  const ip = (req.headers["x-forwarded-for"] as string) || req.ip;

  if (!key.ips.includes(ip) && !ip.startsWith("172")) {
    // 172 is the docker network
    res.json({ status: "error", error: "Invalid IP" });
    return;
  }

  req.body.key = key;
  next();
});

router.post("/ping", async (req, res) => {
  IncomingDataManager.handlePingRequest(req.body, req.body.key as Key);
  res.json({ status: "ok" });
});

router.post("/init", async (req, res) => {
  const server = await ServerDatabaseManager.instance.getServerByIpAndPort(req.body.ip, req.body.port);

  const serverVersion = req.body.version;
  const currentVersion = parseInt(process.env.CURRENT_PLUGIN_VERSION || "9999");

  if (!server) {
    res.json({
      status: "ok",
      serverId: ServerDatabaseManager.instance.createTempServer(
        req.socket.remoteAddress || (req.headers["x-forwarded-for"] as string) || req.ip,
        req.body.port,
        req.body.name
      ),
      updateAvailable: serverVersion < currentVersion,
      latestVersion: currentVersion,
    });
    return;
  }

  Logger.log(
    "DataRouter",
    `Server ${server.id} initialized. IP: ${server.address}:${server.port} Name: ${req.body.name}`
  );
  IncomingDataManager.handleInitRequest(req.body, server.id, req.body.key as Key);
  res.json({ status: "ok", serverId: server?.id });
});

router.post("/join", async (req, res) => {
  const data = await IncomingDataManager.handleJoinRequest(req.body, req.body.key as Key);
  res.json({ status: "ok", ...data });
});

export default router;
