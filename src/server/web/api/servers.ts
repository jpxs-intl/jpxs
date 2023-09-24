import { Router } from "express";
import { serverGrabber } from "../../../index";
import DataStorage from "../../data/dataStorage";
import CacheStorage from "../../database/cacheStorage";
import { Avatar } from "../../../database/entities/avatar.entity";
const router = Router();

router.get("/", async (req, res) => {
  res.json(
    await Promise.all(
      DataStorage.servers.map(async (server: any) => {
        // @ts-ignore
        server.buffer = undefined;

        const extraData = DataStorage.serverData[server.id];
        if (extraData) {
          server.tps = extraData.tps;
          server.customMode = extraData.mode?.enabled
            ? {
                name: extraData.mode.name,
                description: extraData.mode.description,
                author: extraData.mode.author,
              }
            : null;
          server.map = extraData.map;
          server.jpxs = true;
          server.playerList = await Promise.all(
            extraData.players
              .map(async (player) => {
                const phoneNumber = await CacheStorage.gameIdMap.get(player.subRosaId);
                if (phoneNumber) {
                  const user = await CacheStorage.users.get(phoneNumber);
                  if (!user) return null;
                  return {
                    name: await user.getName(),
                    phoneNumber,
                    gameId: player.subRosaId,
                    steamId: user.steamId,
                    discordId: user.discordId,
                    lastSeen: user.lastSeen,
                    firstSeen: user.firstSeen,
                    nameHistory: user.nameHistory.getItems().map((item) => ({
                      name: item.name,
                      date: item.date,
                    })),
                    avatarHistory: await Promise.all(
                      user.avatarHistory.getItems().map((item) => {
                        return new Promise(async (resolve) => {
                          const avatar = await CacheStorage.avatars.get(item.avatar.id);

                          resolve({
                            ...avatar,
                            date: item.date,
                            url: avatar
                              ? Avatar.getOXSAvatarUrl(avatar, {
                                  embed: true,
                                  rotate: true,
                                  antiAliasing: true,
                                  backgroundColor: "000000",
                                  body: false,
                                })
                              : null,
                          });
                        });
                      })
                    ),
                  };
                }
                return null;
              })
              .filter((player) => player !== null)
          );
        } else {
          server.jpxs = false;
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
