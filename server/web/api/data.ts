import { Router, json } from "express";
import ServerDatabaseManager from "../../database/serverDatabaseManager";
import Logger from "../../../utils/logger";
import IncomingDataManager from "../../database/incomingDataManager";
import KeyManager from "../../database/keyManager";
import { KeyPerms } from "../../types/keyPerms";
import { Key } from "../../../database/entities/key.entity";
import LocalIpConverter from "../../../utils/convertIp";
import InstructionManager from "../../data/instruction/instructionManager";

const router = Router();
router.use(json());

router.use(async (req, res, next) => {
  const key = await KeyManager.instance.getKey(req.body.auth as string);

  console.log(req.body);

  if (!key || !key.enabled || !key.hasPermission(KeyPerms.USE_JPXS)) {
    res.json({ status: "error", error: "Invalid Authorization" });

    if (key) console.log(`Invalid key ${key.comment} tried to access the data api`);

    return;
  }

  const ip = (req.headers["x-forwarded-for"] as string) || req.ip;

  req.body.net = {
    ip,
  };

  if (!key.ips.includes(ip) && !ip.startsWith("172") && key.ips.length > 0) {
    // 172 is the docker network
    res.json({ status: "error", error: "Invalid IP" });
    return;
  }

  req.body.key = key;
  next();
});

router.post("/ping", async (req, res) => {
  IncomingDataManager.handlePingRequest(req.body, req.body.key as Key, req.body.net.ip);
  const instructions = InstructionManager.getInstructionsToExecute(req.body.serverId);
  res.json({ status: "ok", instructions });
});

router.post("/init", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) ?? req.socket.remoteAddress;

  const server = await ServerDatabaseManager.instance.getServerByIpAndPort(ip, req.body.port);

  const serverVersion = req.body.version;
  const currentVersion = parseInt(process.env.CURRENT_PLUGIN_VERSION || "9999");

  if (!server) {
    res.json({
      status: "ok",
      serverId: ServerDatabaseManager.instance.createTempServer(
        LocalIpConverter.convertIp(ip),
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

  const instructions = InstructionManager.getInstructionsToExecute(server.id);

  res.json({
    status: "ok",
    serverId: server?.id,
    instructions,
    updateAvailable: serverVersion < currentVersion,
    latestVersion: currentVersion,
  });
});

router.post("/join", async (req, res) => {
  const data = await IncomingDataManager.handleJoinRequest(req.body, req.body.key as Key, req.body.net.ip);
  const instructions = InstructionManager.getInstructionsToExecute(req.body.serverId);
  res.json({ status: "ok", ...data, instructions});
});

router.post("/ban", async (req, res) => {
  const data = await IncomingDataManager.handleBanRequest(req.body, req.body.key as Key, req.body.net.ip);
});

export default router;
