import { Router } from "express";
import path from "path";

import ServersRouter from "./api/servers";
import ServerRouter from "./api/server";
import DataRouter from "./api/data";
import BotRouter from "./api/bot";
import PlayerRouter from "./api/player";
import AuthRouter from "./api/auth/oauthRouter";
import LinkRouter from "./api/autolink";
import PluginRouter from "./api/plugin";
import ActivityRouter from "./api/activity";
import InstallRouter from "./api/install";

import CacheInfo from "../database/cache/cacheInfo";
import Metrics from "../data/metrics";

const router = Router();

router.use("/servers", ServersRouter);
router.use("/server", ServerRouter);
router.use("/data", DataRouter);
router.use("/bot", BotRouter);
router.use("/player", PlayerRouter);
router.use("/auth", AuthRouter);
router.use("/autolink", LinkRouter);
router.use("/plugin", PluginRouter);
router.use("/activity", ActivityRouter);
router.get("/cache", async (req, res) => {
  res.send(CacheInfo.getCacheReport());
});

router.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.send(await Metrics.getMetrics());
});

export default router;
