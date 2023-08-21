import { Router } from "express";
import { serverGrabber } from "../../../index";
import DataStorage from "../../data/dataStorage";
import CacheStorage from "../../database/cacheStorage";
const router = Router();

router.get("/", async (req, res) => {
  res.json(
    Promise.all(
      DataStorage.servers.map(async (server: any) => {
        // @ts-ignore
        server.buffer = undefined;

        const extraData = DataStorage.serverData[server.id];
        if (extraData) {
          server.tps = extraData.tps;
          server.mode = extraData.mode?.enabled
            ? {
                name: extraData.mode.name,
                description: extraData.mode.description,
                author: extraData.mode.author,
              }
            : server.mode;
          server.map = extraData.map;
          server.players = Promise.all(
            extraData.players
              .map(async (player) => {
                const phoneNumber = await CacheStorage.gameIdMap.get(player.subRosaId);
                if (phoneNumber) {
                  return CacheStorage.users.get(phoneNumber);
                }
                return null;
              })
              .filter((player) => player !== null)
          );
        }

        return server;
      })
    )
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
