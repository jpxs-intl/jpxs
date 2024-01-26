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

  Logger.debug("DataRouter", `Incoming request from ${(req.headers["x-forwarded-for"] as string) || req.ip}`);

  if (!key || !key.enabled || !key.hasPermission(KeyPerms.USE_JPXS)) {
    res.json({ status: "error", error: "Invalid Authorization" });

    if (key) Logger.error("API", `Invalid key ${key.comment} tried to access the data api`);

    return;
  }

  const ip = (req.headers["x-forwarded-for"] as string) || req.ip;

  req.body.net = {
    ip,
  };

 if (!key.ips.includes(ip) && key.ips.length > 0) {
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
  const ip = req.body.net.ip

  Logger.info("DataRouter", `initializing server: ${req.body.net.ip}:${req.body.port}`)

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
  res.json({ status: "ok", ...data, instructions });
});

router.post("/punish", async (req, res) => {
  const data = await IncomingDataManager.handlePunishmentRequest(
    req.body,
    req.body.key as Key,
    req.body.net.ip
  );
  const instructions = InstructionManager.getInstructionsToExecute(req.body.serverId);
  res.json({ status: "ok", ...data, instructions });
});

router.post("/chat", async (req, res) => {});

router.post("/instruction", async (req, res) => {
  const data = await IncomingDataManager.handleInstructionRequest(
    req.body,
    req.body.key as Key,
    req.body.net.ip
  );
  return res.json({ status: "ok", ...data });
});

export default router;
