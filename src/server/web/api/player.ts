import { Router } from "express";
import { User } from "../../../database/entities/user.entity";
import { db } from "../../../index";
import { Avatar } from "../../../database/entities/avatar.entity";
import { NameHistory } from "../../../database/entities/nameHistory.entity";
import { AvatarHistory } from "../../../database/entities/avatarHistory.entity";
import CacheStorage from "../../database/cacheStorage";
import Util from "../../../utils/util";
const router = Router();

router.get("/autocomplete/:query", async (req, res) => {
  const query = req.params.query;

  const players = (await CacheStorage.playerAutoComplete.get(query)) || [];

  return res.json({
    success: true,
    players: await Promise.all(
      players.map(async (player) => {
        return new Promise(async (resolve) => {
          let nameHistory = player.nameHistory.isInitialized()
            ? player.nameHistory.toArray()
            : await player.nameHistory.init().then(() => player.nameHistory.toArray());
          resolve({
            nameHistory: nameHistory.sort((a, b) => b.date.getTime() - a.date.getTime())[0].name,
            gameId: player.gameId,
            phoneNumber: player.phoneNumber,
          });
        });
      })
    ),
  });
});



router.get("/:identifier", async (req, res) => {
  const start = Date.now();

  const identifier = req.params.identifier;

  const phoneRegex = /^((\d{7})|(\d{3}-\d{4}))$/g;
  const discordRegex = /^\d{17,19}$/g;
  const steamRegex = /^\d{17}$/g;
  const isAllDigits = /^\d+$/g;

  let players: User[] | null = null;
  let searchMode: "phone" | "discord" | "steam" | "gameId" | "name" | "unknown" = "unknown";

  if (phoneRegex.test(identifier)) {
    players = Util.formatNullOrArray<User>(
      (await CacheStorage.users.get(parseInt(identifier.replace("-", "")))) as User
    );
    searchMode = "phone";
  } else if (steamRegex.test(identifier)) {
    players = Util.formatNullOrArray(
      (await CacheStorage.users.get((await CacheStorage.steamIdMap.get(identifier)) ?? 0)) as User
    );
    searchMode = "steam";
  } else if (discordRegex.test(identifier)) {
    players = await db.getEntityManager().find(
      User,
      { discordId: identifier },
      {
        populate: ["nameHistory", "avatarHistory"],
      }
    );
    searchMode = "discord";
  } else if (isAllDigits.test(identifier)) {
    players = Util.formatNullOrArray(
      (await CacheStorage.users.get((await CacheStorage.gameIdMap.get(parseInt(identifier))) ?? 0)) as User
    );
    searchMode = "gameId";
  } else {
    players = await CacheStorage.playerAutoComplete.get(identifier);
    searchMode = "name";
  }

  if (!players || players.length === 0) {
    return res.status(404).json({
      success: false,
      error: "Player not found",
      searchMode,
    });
  }

  let playersToLoad: Promise<{
    name?: string;
    avatar?: Avatar;
    description: string;
    gameId: number;
    phoneNumber: number;
    discordId?: string;
    steamId?: string;
    jpxsSupportLevel: number;
    firstSeen: Date;
    lastSeen: Date;
    nameHistory: Omit<NameHistory, "player">[];
    avatarHistory: Omit<AvatarHistory, "player">[];
  }>[] = [];

  players.forEach(async (player) => {
    playersToLoad.push(
      new Promise(async (resolve, reject) => {
        if (!player.nameHistory.isInitialized()) await player.nameHistory.init();
        if (!player.avatarHistory.isInitialized()) await player.avatarHistory.init();

        const avatarHistory = await db.em.find(
          AvatarHistory,
          { player },
          {
            populate: ["avatar"],
          }
        );

        resolve({
          name: await player.getName(),
          avatar: player.avatarHistory.getItems().sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.avatar,
          description: player.description,
          gameId: player.gameId,
          phoneNumber: player.phoneNumber,
          discordId: player.discordId,
          steamId: player.steamId,
          jpxsSupportLevel: parseInt(player.supporterLevel.toString()) ?? 0,
          firstSeen: player.firstSeen,
          lastSeen: player.lastSeen,
          nameHistory: player.nameHistory.getItems().map((item) => {
            // @ts-ignore
            item.player = undefined;
            return item;
          }),
          avatarHistory: avatarHistory.map((item) => {
            return {
              ...item,
              player: undefined,
              url: Avatar.getOXSAvatarUrl(item.avatar, {
                embed: true,
                antiAliasing: true,
                backgroundColor: "000000",
                body: false,
              }),
            };
          }),
        });
      })
    );
  });

  const loadedPlayers = await Promise.all(playersToLoad);

  return res.json({
    success: true,
    requestTime: Date.now() - start,
    searchMode,
    players: loadedPlayers,
  });
});

export default router;
