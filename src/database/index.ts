import { MikroORM, PostgreSqlDriver, EntityManager } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import Logger from "../utils/logger";

let instance: Database;

export default class Database {
  private _orm!: MikroORM;
  private _em!: EntityManager<PostgreSqlDriver>;

  constructor(callback?: () => void) {
    if (instance) {
      return instance;
    }

    instance = this;

    this.init(callback);
  }

  public async init(callback?: () => void): Promise<void> {
    const _orm = await MikroORM.init<PostgreSqlDriver>({
      entities: ["./dist/database/entities/*.js", "./dist/server/discord/modules/**/entities/*.js"],
      type: "postgresql",
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

    this._orm = _orm;
    this._em = _orm.em;

    Logger.info("Database", "Database initialized");

    if (callback) {
      callback();
    }
  }

  public async close(): Promise<void> {
    await this._orm.close(true);
  }

  public getEntityManager(): EntityManager<PostgreSqlDriver> {
    return this._em.fork();
  }

  public get em(): EntityManager<PostgreSqlDriver> {
    return this._em.fork();
  }

  public getOrm(): MikroORM {
    return this._orm;
  }

  public get orm(): MikroORM {
    return this._orm;
  }
}
