import { Router } from "express";
import KeyManager from "../../database/keyManager";
import path from "path";
const router = Router();

router.get("/:key", async (req, res) => {
  const keyInfo = await KeyManager.instance.getKey(req.params.key);

  if (!keyInfo || !keyInfo.enabled || !req.headers["user-agent"]?.includes("cpp-httplib")) {
    return res.status(401).send("Unauthorized");
  }

  res.setHeader("Content-Type", "text/plain").sendFile(path.resolve("./src/assets/lua/pluginDownload.lua"));
});

export default router;
