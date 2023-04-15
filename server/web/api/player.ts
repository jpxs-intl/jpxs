import { Router } from "express";
import { User } from "../../../database/entities/user.entity";
import { db } from "../../..";
const router = Router();

router.get("/autocomplete/:query", async (req, res) => {
  const query = req.params.query;

  const players = await db.getEntityManager().find(User, {
    nameHistory: {
      name: {
        $re: `^${query}`,
      },
    },
  });

  if (!players || players.length === 0) {
    return res.status(404).json({
      success: false,
      error: "Player not found",
    });
  }

  return res.json({
    success: true,
    players: players.map((player) => {
      return {
        name: player.name,
        gameId: player.gameId,
        phoneNumber: player.phoneNumber,
      };
    }),
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
      players = await db.getEntityManager().find(User, { phoneNumber: parseInt(identifier.replace("-", "")) });
      searchMode = "phone";
    } else if (discordRegex.test(identifier)) {
      players = await db.getEntityManager().find(User, { discordId: identifier });
      searchMode = "discord";
    } else if (steamRegex.test(identifier)) {
      players = await db.getEntityManager().find(User, { steamId: identifier });
      searchMode = "steam";
    } else if (isAllDigits.test(identifier)) {
      players = await db.getEntityManager().find(User, { gameId: parseInt(identifier) });
      searchMode = "gameId";
    } else {
      players = await db.getEntityManager().find(User, {
        nameHistory: {
          name: identifier,
        },
      });
      searchMode = "name";
    }
  
    if (!players || players.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Player not found",
        searchMode,
      });
    }
  
    return res.json({
      success: true,
      requestTime: Date.now() - start,
      searchMode,
      players: players.map((player) => {
        return {
          name: player.name,
          avatar: player.avatar,
          description: player.description,
          gameId: player.gameId,
          phoneNumber: player.phoneNumber,
          discordId: player.discordId,
          steamId: player.steamId,
          firstSeen: player.firstSeen,
          lastSeen: player.lastSeen,
          nameHistory: player.nameHistory,
          avatarHistory: player.avatarHistory,
        };
      }),
    });
  });

export default router;
