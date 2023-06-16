import { Router } from "express";
import { serverGrabber } from "../../..";
import DataStorage from "../../data/dataStorage";
const router = Router();

router.get("/", async (req, res) => {
  res.json(
    DataStorage.servers.map((server) => {
      // @ts-ignore
      server.buffer = undefined;
      return server;
    })
  );
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
