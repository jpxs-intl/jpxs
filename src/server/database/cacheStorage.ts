import { db } from "../../index";
import { Punishment } from "../../database/entities/punishment.entity";
import { Server } from "../../database/entities/server.entity";
import { Snapshot } from "../../database/entities/snapshot.entity";
import { User } from "../../database/entities/user.entity";
import UpdateableCache from "./cache/updateableCache";
import OXSGrabber from "../data/oxsGrabber";
import Logger from "../../utils/logger";
import { Avatar } from "../../database/entities/avatar.entity";

export default class CacheStorage {
  public static users = {
    _cache: new UpdateableCache<User, number>(
      async (key: number) => {
        const user = await db.getEntityManager().findOne(
          User,
          {
            phoneNumber: key,
          },
          {
            populate: ["nameHistory", "avatarHistory"],
          }
        );

        if (user) {
          if (!user.nameHistory.isInitialized()) {
            Logger.info("CacheStorage", `Initializing name history for ${user.phoneNumber}`);
            user.nameHistory.init();
          }

          if (!user.avatarHistory.isInitialized()) {
            Logger.info("CacheStorage", `Initializing avatar history for ${user.phoneNumber}`);
            user.avatarHistory.init();
          }

          return user;
        }

        // use OXS as backup
        // return await OXSGrabber.getPlayer(key);
        return undefined;
      },
      {
        limitBy: "time",
        // 30 minutes
        limitFactor: 30 * 60 * 1000,
        prune: true,
      }
    ),
    get: async (phoneNumber: number): Promise<User | undefined> => {
      return await CacheStorage.users._cache.getOrFetch(phoneNumber);
    },
    set: (phoneNumber: number, user: User): void => {
      CacheStorage.users._cache.set(phoneNumber, user);
    },
    has: (phoneNumber: number): boolean => {
      return CacheStorage.users._cache.has(phoneNumber);
    },
    clear: (): void => {
      CacheStorage.users._cache.clear();
    },
    identSearch: async (identifier: string): Promise<User | undefined> => {
      const phoneRegex = /^((\d{7})|(\d{3}-\d{4}))$/g;
      const discordRegex = /^\d{17,19}$/g;
      const steamRegex = /^\d{17}$/g;
      const isAllDigits = /^\d+$/g;

      let player: User | undefined = undefined;

      if (phoneRegex.test(identifier)) {
        player = await CacheStorage.users.get(parseInt(identifier.replace("-", "")));
      } else if (discordRegex.test(identifier)) {
        player =
          (await db.getEntityManager().findOne(
            User,
            { discordId: identifier },
            {
              populate: true,
            }
          )) ?? undefined;
      } else if (steamRegex.test(identifier)) {
        player =
          (await CacheStorage.users.get((await CacheStorage.steamIdMap.get(identifier)) ?? -1)) ?? undefined;
      } else if (isAllDigits.test(identifier)) {
        player =
          (await CacheStorage.users.get((await CacheStorage.gameIdMap.get(parseInt(identifier))) ?? -1)) ??
          undefined;
      } else {
        player =
          (await db
            .getEntityManager()
            .find(User, {
              nameHistory: {
                name: new RegExp(identifier, "i"),
              },
            })
            .then((users) => users[0])) ?? undefined;
      }

      if (player && !player.nameHistory.isInitialized()) await player.nameHistory.init();

      return player;
    },
  };

  public static playerAutoComplete = {
    _cache: new UpdateableCache<User[], string>(
      async (query: string) => {
        const users = await db.getEntityManager().find(
          User,
          {
            nameHistory: {
              name: new RegExp(`${query}`, "i"),
            },
          },
          {
            limit: 25,
          }
        );

        let res: User[] | undefined = undefined;


        if (users) {
          res = await Promise.all(
            users.map(async (user) => {
              if (!user.nameHistory.isInitialized()) await user.nameHistory.init();
              return user;
            })
          ).then((users) =>

            users.sort((a, b) => {
              let score = 0;

              console.log(a.phoneNumber, b.phoneNumber, score);

              if (a.nameHistory.isInitialized() && b.nameHistory.isInitialized()) {
                // compare against a's names
                a.nameHistory.toArray().forEach((name) => {
                  if (name.name.toLowerCase().includes(query.toLowerCase())) score += 1;
                })

                // compare against b's names
                b.nameHistory.toArray().forEach((name) => {
                  if (name.name.toLowerCase().includes(query.toLowerCase())) score -= 1;
                })

                const aName = a.nameHistory.toArray().sort((a, b) => b.date.getTime() - a.date.getTime())[0].name;
                const bName = b.nameHistory.toArray().sort((a, b) => b.date.getTime() - a.date.getTime())[0].name;

                // if it's their current name, give them a boost

                if (aName.toLowerCase() === query.toLowerCase()) score -= 5;
                if (bName.toLowerCase() === query.toLowerCase()) score += 5;

                console.log(aName, bName, score);

              }

              return score;
            })
          );
        }

        // if ((res?.length || 0) < 25) {
        //   OXSGrabber.search(query).then(async (result) => {
        //     if (result) {
        //       const users = (await Promise.all(
        //         result.map((user) => {
        //           return CacheStorage.users.get(user.phone);
        //         })
        //       ).then((users) => users.filter((user) => user != undefined))) as User[];

        //       res = [...(res || []), ...users].slice(0, 25);
        //     }

        //     return res;
        //   });
        // }

        return res;
      },
      {
        prune: true,
        limitBy: "time",
        // 1 day
        limitFactor: 24 * 60 * 60 * 1000,
      }
    ),
    get: async (query: string): Promise<User[]> => {
      return (await CacheStorage.playerAutoComplete._cache.getOrFetch(query)) ?? [];
    },
    has: (query: string): boolean => {
      return CacheStorage.playerAutoComplete._cache.has(query);
    },
    clear: (): void => {
      CacheStorage.playerAutoComplete._cache.clear();
    },
  };

  public static steamIdMap = {
    _cache: new UpdateableCache<number, string>(
      async (key: string) => {
        const user = await db.getEntityManager().findOne(
          User,
          {
            steamId: key,
          },
          {
            populate: ["nameHistory", "avatarHistory"],
          }
        );

        if (!user?.nameHistory.isInitialized()) await user?.nameHistory.init();
        if (!user?.avatarHistory.isInitialized()) await user?.avatarHistory.init();

        if (user) {
          CacheStorage.users.set(user.phoneNumber, user);
          CacheStorage.gameIdMap.set(user.gameId, user.phoneNumber);
          return user.phoneNumber;
        }

        return undefined;
      },
      {
        limitBy: "size",
        limitFactor: 1000,
      }
    ),
    get: async (steamId: string): Promise<number | undefined> => {
      return CacheStorage.steamIdMap._cache.getOrFetch(steamId);
    },
    set: (steamId: string, phoneNumber: number): void => {
      CacheStorage.steamIdMap._cache.set(steamId, phoneNumber);
    },
    has: (steamId: string): boolean => {
      return CacheStorage.steamIdMap._cache.has(steamId);
    },
    clear: (): void => {
      CacheStorage.steamIdMap._cache.clear();
    },
  };

  public static gameIdMap = {
    _cache: new UpdateableCache<number, number>(
      async (key: number) => {
        const user = await db.getEntityManager().findOne(
          User,
          {
            gameId: key,
          },
          {
            populate: ["nameHistory", "avatarHistory"],
          }
        );

        if (!user?.nameHistory.isInitialized()) await user?.nameHistory.init();
        if (!user?.avatarHistory.isInitialized()) await user?.avatarHistory.init();

        if (user) {
          CacheStorage.users.set(user.phoneNumber, user);
          if (user.steamId) CacheStorage.steamIdMap.set(user.steamId, user.phoneNumber);
          return user.phoneNumber;
        }
        return undefined;
      },
      {
        limitBy: "size",
        limitFactor: 1000,
      }
    ),
    get: (gameId: number): Promise<number | undefined> => {
      return CacheStorage.gameIdMap._cache.getOrFetch(gameId);
    },
    set: (gameId: number, phoneNumber: number): void => {
      CacheStorage.gameIdMap._cache.set(gameId, phoneNumber);
    },
    has: (gameId: number): boolean => {
      return CacheStorage.gameIdMap._cache.has(gameId);
    },
    clear: (): void => {
      CacheStorage.gameIdMap._cache.clear();
    },
  };

  public static servers = {
    _cache: new UpdateableCache<Server, string>(
      async (key: string) => {
        const server = await db.getEntityManager().findOne(Server, {
          id: key,
        });

        if (server) {
          return server;
        }
        return undefined;
      },
      {
        limitBy: "time",
        // 1 hour
        limitFactor: 60 * 60 * 1000,
        prune: true,
      }
    ),
    get: async (id: string): Promise<Server | undefined> => {
      return await CacheStorage.servers._cache.getOrFetch(id);
    },
    set: (id: string, server: Server): void => {
      CacheStorage.servers._cache.set(id, server);
    },
    has: (id: string): boolean => {
      return CacheStorage.servers._cache.has(id);
    },
    clear: (): void => {
      CacheStorage.servers._cache.clear();
    },
    getByIpAndPort: async (ip: string, port: number): Promise<Server[]> => {
      const servers = await db.getEntityManager().find(Server, {
        address: ip,
        port,
      });

      CacheStorage.servers._cache.setMany(
        ...servers.map((server) => [server.id, server] as [string, Server])
      );
      return servers.sort((a, b) => {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
    },
  };

  public static addressMap = {
    _cache: new UpdateableCache<string, string>(
      async (info: string) => {
        const [address, port] = info.split(":");

        const server = await db.getEntityManager().findOne(Server, {
          address,
          port: parseInt(port),
        });
        if (server) {
          return server.id;
        }
        return undefined;
      },
      {
        prune: false,
        staleDataThreshold: -1,
      }
    ),
    get: async (info: { address: string; port: number }): Promise<string | undefined> => {
      return await CacheStorage.addressMap._cache.getOrFetch(`${info.address}:${info.port}`);
    },
    set: (
      info: {
        address: string;
        port: number;
      },
      serverId: string
    ): void => {
      CacheStorage.addressMap._cache.set(`${info.address}:${info.port}`, serverId);
    },
    has: (info: { address: string; port: number }): boolean => {
      return CacheStorage.addressMap._cache.has(`${info.address}:${info.port}`);
    },
    clear: (): void => {
      CacheStorage.addressMap._cache.clear();
    },
  };

  public static snapshots = {
    _cache: new UpdateableCache<Snapshot, string>(
      async (key: string) => {
        const snapshot = await db.getEntityManager().findOne(Snapshot, {
          id: key,
        });

        if (snapshot) {
          return snapshot;
        }
        return undefined;
      },
      {
        limitBy: "time",
        // 10 minutes
        limitFactor: 10 * 60 * 1000,
        prune: true,
      }
    ),
    get: async (id: string): Promise<Snapshot | undefined> => {
      return await CacheStorage.snapshots._cache.getOrFetch(id);
    },
    set: (id: string, snapshot: Snapshot): void => {
      CacheStorage.snapshots._cache.set(id, snapshot);
    },
    has: (id: string): boolean => {
      return CacheStorage.snapshots._cache.has(id);
    },
    clear: (): void => {
      CacheStorage.snapshots._cache.clear();
    },
    getServerSnapshots: async (serverId: string): Promise<Snapshot[]> => {
      const res = await db.getEntityManager().find(
        Snapshot,
        {
          server: serverId,
        },
        {
          orderBy: {
            timestamp: "DESC",
          },
        }
      );
      CacheStorage.snapshots._cache.setMany(
        ...res.map((snapshot) => [snapshot.id, snapshot] as [string, Snapshot])
      );
      return res;
    },
    getServerName: async (serverId: string): Promise<string | undefined> => {
      const snapshot = await db.em.findOne(Snapshot, {
        server: serverId,
      }, {
        orderBy: {
          timestamp: "DESC",
        },
      });

      return snapshot?.name;
    }
  };

  public static bans = {
    _cache: new UpdateableCache<Punishment, number>(async (key: number) => {
      return await db
        .getEntityManager()
        .findOne(Punishment, {
          id: key,
        })
        .then((b) => b || undefined);
    }),
    get: async (id: number): Promise<Punishment | undefined> => {
      return await CacheStorage.bans._cache.getOrFetch(id);
    },
    set: (ban: Punishment): void => {
      CacheStorage.bans._cache.set(ban.id, ban);
    },
    clear: (): void => {
      CacheStorage.bans._cache.clear();
    },
    getServerBans: async (serverId: string): Promise<Punishment[]> => {
      return [
        ...(await db.getEntityManager().find(Punishment, {
          server: serverId,
          $or: [
            {
              expiresAt: {
                $gt: new Date(),
              },
            },
            {
              expiresAt: {
                $eq: new Date(0),
              },
            },
          ],
        })),
      ];
    },
  };

  public static avatars = {
    _cache: new UpdateableCache<Avatar, string>(async (key: string) => {
      const avatar = await db.getEntityManager().findOne(Avatar, {
        id: key,
      });

      if (avatar) {
        return avatar;
      }
      return undefined;
    }),
    get: async (id: string): Promise<Avatar | undefined> => {
      return await CacheStorage.avatars._cache.getOrFetch(id);
    },
    set: (id: string, avatar: Avatar): void => {
      CacheStorage.avatars._cache.set(id, avatar);
    },
    has: (id: string): boolean => {
      return CacheStorage.avatars._cache.has(id);
    },
  };
}
