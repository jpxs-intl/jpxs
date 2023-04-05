import { db } from "../..";
import { User } from "../../database/entities/user.entity";
import Cache from "./cache/cache";
import UpdateableCache from "./cache/updateableCache";

export default class UserDatabaseManager {
  private _userCache: UpdateableCache<User, number>; // key: phoneNumber, value: User
  private _steamIdCache: Cache<number, string>; // key: steamId, value: phoneNumber
  private _gameIdCache: Cache<number, number>; // key: gameId, value: phoneNumber

  private static _instance: UserDatabaseManager;

  public static get instance(): UserDatabaseManager {
    if (!this._instance) {
      this._instance = new UserDatabaseManager();
    }
    return this._instance;
  }

  constructor() {
    this._gameIdCache = new Cache<number, number>("size", 100);
    this._steamIdCache = new Cache<number, string>("size", 100);

    this._userCache = new UpdateableCache<User, number>(
      async (key: number) => {
        const user = await db.getEntityManager().findOne(User, {
          phoneNumber: key,
        });

        if (user) {
          this._steamIdCache.set(user.steamId, user.phoneNumber);
          this._gameIdCache.set(user.gameId, user.phoneNumber);
          return user;
        }
        return undefined;
      },
      {
        prune: true,
        staleDataThreshold: 10,
      }
    );
  }

  public async getUser(phoneNumber: number): Promise<User | undefined> {
    return await this._userCache.getOrFetch(phoneNumber);
  }

  public async getUserBySteamId(steamId: string): Promise<User | undefined> {
    const phoneNumber = this._steamIdCache.get(steamId);
    if (phoneNumber) {
      return await this._userCache.getOrFetch(phoneNumber);
    }

    const user = await db.getEntityManager().findOne(User, {
      steamId: steamId,
    });

    if (user) {
      this._steamIdCache.set(user.steamId, user.phoneNumber);
      this._gameIdCache.set(user.gameId, user.phoneNumber);
      this._userCache.set(user.phoneNumber, user);
    }
    return user || undefined;
  }

  public async getUserByGameId(gameId: number): Promise<User | undefined> {
    const phoneNumber = this._gameIdCache.get(gameId);
    if (phoneNumber) {
      return await this._userCache.getOrFetch(phoneNumber);
    }

    const user = await db.getEntityManager().findOne(User, {
      gameId: gameId,
    });

    if (user) {
      this._steamIdCache.set(user.steamId, user.phoneNumber);
      this._gameIdCache.set(user.gameId, user.phoneNumber);
      this._userCache.set(user.phoneNumber, user);
    }
    return user || undefined;
  }

  public async createUser(user: User): Promise<User> {
    await db.getEntityManager().persistAndFlush(user);
    this._userCache.set(user.phoneNumber, user);
    this._steamIdCache.set(user.steamId, user.phoneNumber);
    this._gameIdCache.set(user.gameId, user.phoneNumber);
    return user;
  }

  public async updateUser(user: User): Promise<User> {
    await db.getEntityManager().persistAndFlush(user);
    this._userCache.set(user.phoneNumber, user);
    this._steamIdCache.set(user.steamId, user.phoneNumber);
    this._gameIdCache.set(user.gameId, user.phoneNumber);
    return user;
  }
}
