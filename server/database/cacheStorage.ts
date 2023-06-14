import { db } from "../..";
import { Server } from "../../database/entities/server.entity";
import { Snapshot } from "../../database/entities/snapshot.entity";
import { User } from "../../database/entities/user.entity";
import Cache from "./cache/cache";
import UpdateableCache from "./cache/updateableCache";

export default class CacheStorage {
  public static users = {
    _cache: new UpdateableCache<User, number>(
      async (key: number) => {
        const user = await db.getEntityManager().findOne(User, {
          phoneNumber: key,
        });

        if (user) {
          return user;
        }
        return undefined;
      },
      {
        limitBy: "size",
        limitFactor: 1000,
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
  };

  public static playerAutoComplete = {
    _cache: new UpdateableCache<User[], string>(async (query: string) => {
      const users = await db.getEntityManager().find(User, {
        nameHistory: {
          name: new RegExp(`^${query}`, "i"),
        },
      });

      if (users) {
        return users;
      }
      return undefined;
    }, {
        prune: true,
        limitBy: "size",
        limitFactor: 1000,
    }),
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
        const user = await db.getEntityManager().findOne(User, {
          steamId: key,
        });

        if (user) {
          CacheStorage.users.set(user.phoneNumber, user);
          CacheStorage.gameIdMap.set(user.gameId, user.phoneNumber);
          return user.phoneNumber;
        }

        return undefined;
      },
      {
        limitBy: "size",
        limitFactor: 100,
        prune: true,
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
        const user = await db.getEntityManager().findOne(User, {
          gameId: key,
        });

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
    _cache: new UpdateableCache<Server, string>(async (key: string) => {
      const server = await db.getEntityManager().findOne(Server, {
        id: key,
      });

      if (server) {
        return server;
      }
      return undefined;
    }, {
        prune: true,
        limitBy: "size",
        limitFactor: 1000
    }),
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
  };

  public static addressMap = {
    _cache: new UpdateableCache<string, string>(
      async (info: string) => {
        const [address, port, identifier] = info.split(":");

        const server = await db.getEntityManager().findOne(Server, {
          address,
          port: parseInt(port),
          identifier: parseInt(identifier),
        });
        if (server) {
          return server.id;
        }
        return undefined;
      },
      {
        prune: false,
        staleDataThreshold: -1
      }
    ),
    get: async (info: { address: string; port: number; identifier: number }): Promise<string | undefined> => {
      return await CacheStorage.addressMap._cache.getOrFetch(
        `${info.address}:${info.port}:${info.identifier}`
      );
    },
    set: (
      info: {
        address: string;
        port: number;
        identifier: number;
      },
      serverId: string
    ): void => {
      CacheStorage.addressMap._cache.set(`${info.address}:${info.port}:${info.identifier}`, serverId);
    },
    has: (info: { address: string; port: number; identifier: number }): boolean => {
      return CacheStorage.addressMap._cache.has(`${info.address}:${info.port}:${info.identifier}`);
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
        limitBy: "size",
        limitFactor: 1000,
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
      const res = await db.getEntityManager().find(Snapshot, {
        server: serverId,
      });
      CacheStorage.snapshots._cache.setMany(
        ...res.map((snapshot) => [snapshot.id, snapshot] as [string, Snapshot])
      );
      return res;
    },
  };
}
