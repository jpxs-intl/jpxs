import { MikroORM, PostgreSqlDriver, EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import Logger from "../../utils/logger.js";
import { DatabaseChannel } from "../messaging/channels/database.js";
import { Avatar } from "./entities/avatar.entity.js";
import { AvatarHistory } from "./entities/avatarHistory.entity.js";
import { Player } from "./entities/player.entity.js";
import { Server } from "./entities/server.entity.js";
import { Session } from "./entities/session.entity.js";
import { Key } from "./entities/key.entity.js";
import { Tag } from "./entities/tag.entity.js";
import { PlayerRepository } from "./repositories/player.repository.js";

let instance: Database;

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  avatar: EntityRepository<Avatar>
  avatarHistory: EntityRepository<AvatarHistory>
  key: EntityRepository<Key>
  player: PlayerRepository
  server: EntityRepository<Server>
  session: EntityRepository<Session>
  tag: EntityRepository<Tag>
}

let cache: Services;
export default class Database {
  public readonly clientid = "jpxs.database";

  private orm!: MikroORM;

  constructor() {
    if (instance) {
      return instance;
    }

    instance = this;
  }

  public async init(): Promise<Services> {
    const orm = await MikroORM.init<PostgreSqlDriver>({
      entities: ["./dist/server/database/entities/*.js"],
      driver: PostgreSqlDriver,
      tsNode: true,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      dbName: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      metadataProvider: TsMorphMetadataProvider,
      debug: process.env.DEBUG === "true",
    }).catch((err) => {
      Logger.error("Database", "Failed to initialize database");
      Logger.error("Database", err);
      console.error(err);
      process.exit(1);
    });

    Logger.info("Database", "Database initialized");
    DatabaseChannel.publish(this.clientid, "database:initialized", {});

    const em = orm.em.fork();

    cache = {
      orm,
      em,
      avatar: em.getRepository(Avatar),
      avatarHistory: em.getRepository(AvatarHistory),
      key: em.getRepository(Key),
      player: em.getRepository(Player),
      server: em.getRepository(Server),
      session: em.getRepository(Session),
      tag: em.getRepository(Tag)
    };

    this.orm = orm;

    return cache;
  }

  public async close(): Promise<void> {
    await this.orm.close(true);
  }

  public get isReady(): boolean {
    return !!this.orm;
  }
}