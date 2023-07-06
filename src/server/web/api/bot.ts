import { Router, json } from "express";
import KeyManager from "../../database/keyManager";
const router = Router();

router.use(json());
router.use((req, res, next) => {
  if (!req.headers["authorization"]) {
    return res.status(401).json({
      error: "No credentials sent!",
    });
  } else if (req.headers["authorization"] !== process.env.BOT_TOKEN) {
    return res.status(401).json({
      error: "Invalid credentials sent!",
    });
  }

  next();
});

router.post("/key/create", (req, res) => {
  const owner = req.body.owner as string;
  const ips = req.body.ips as string[];
  const comment = req.body.comment as string;
  const permissionType = req.body.permissionType as "group" | "custom";
  const permissions = req.body.permissions as number;

  if (!owner || !ips || !comment) {
    return res.status(400).json({
      error: "Missing required fields!",
    });
  }

  KeyManager.instance
    .createKey(owner, ips, comment, permissionType, permissions, true)
    .then((key) => {
      res.json({
        key,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

router.post("/key/disable", (req, res) => {
  const key = req.body.key as string;
  KeyManager.instance
    .setKeyEnabled(key, false)
    .then(() => {
      res.json({
        success: true,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
});

router.post("/key/enable", (req, res) => {
    const key = req.body.key as string;
    KeyManager.instance
        .setKeyEnabled(key, true)
        .then(() => {
            res.json({
                success: true,
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err.message,
            });
        });
});

router.post("/key/delete", (req, res) => {
    const key = req.body.key as string;
    KeyManager.instance
        .removeKey(key)
        .then(() => {
            res.json({
                success: true,
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err.message,
            });
        });
});

export default router;
