import { Router } from "express";
import { serverGrabber } from "../../..";
const router = Router();

router.get("/", async (req, res) => {
  const data = await serverGrabber.getServerData();
  data.map((server) => {
    // @ts-ignore
    server.buffer = undefined;
  });

  res.json(data);
});

router.get("/:masterserver", async (req, res) => {
  const data = await serverGrabber.getServerDataForMasterServer(req.params.masterserver);
  data.map((server) => {
    // @ts-ignore
    server.buffer = undefined;
  });

  res.json(data);
});

export default router;
