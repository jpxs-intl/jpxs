import { Migration } from '@mikro-orm/migrations';

export class Migration20250825013003 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "storage" ("key" varchar(64) not null, "value" text not null, "token" varchar(16) null, constraint "storage_pkey" primary key ("key"));`);

    this.addSql(`alter table "player" alter column "game_id" type int using ("game_id"::int);`);
    this.addSql(`create sequence if not exists "player_game_id_seq";`);
    this.addSql(`select setval('player_game_id_seq', (select max("game_id") from "player"));`);
    this.addSql(`alter table "player" alter column "game_id" set default nextval('player_game_id_seq');`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "storage" cascade;`);

    this.addSql(`alter table "player" alter column "game_id" type int4 using ("game_id"::int4);`);
  }

}
