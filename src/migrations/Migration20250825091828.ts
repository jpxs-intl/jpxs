import { Migration } from '@mikro-orm/migrations';

export class Migration20250825091828 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "auth_user" drop constraint "auth_user_linked_to_id_foreign";`);

    this.addSql(`alter table "auth_session" drop constraint "auth_session_user_id_foreign";`);

    this.addSql(`create table "user" ("id" varchar(255) not null, "display_name" varchar(255) not null, "linked_to_game_id" int null, "created_at" timestamptz not null, constraint "user_pkey" primary key ("id"));`);
    this.addSql(`alter table "user" add constraint "user_linked_to_game_id_unique" unique ("linked_to_game_id");`);

    this.addSql(`create table "user_auth" ("auth_id" varchar(255) not null, "username" varchar(255) not null, "type" AuthType not null, "token" text not null, "token2" text null, "user_id" varchar(255) not null, "created_at" timestamptz not null, "expires_at" timestamptz null, "scopes" text[] not null, constraint "user_auth_pkey" primary key ("auth_id"));`);

    this.addSql(`alter table "user" add constraint "user_linked_to_game_id_foreign" foreign key ("linked_to_game_id") references "player" ("game_id") on update cascade on delete set null;`);

    this.addSql(`alter table "user_auth" add constraint "user_auth_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`drop table if exists "auth_user" cascade;`);

    this.addSql(`alter table "auth_session" drop constraint "auth_session_user_id_foreign";`);

    this.addSql(`alter table "auth_session" add constraint "auth_session_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "auth_session" drop constraint "auth_session_user_id_foreign";`);

    this.addSql(`alter table "user_auth" drop constraint "user_auth_user_id_foreign";`);

    this.addSql(`create table "auth_user" ("id" varchar(255) not null, "username" varchar(255) not null, "token" varchar(255) not null, "refresh_token" varchar(255) null, "created_at" timestamptz not null, "expires_at" timestamptz null, "scopes" text[] not null, "linked_to_id" varchar(255) null, constraint "auth_user_pkey" primary key ("id"));`);

    this.addSql(`alter table "auth_user" add constraint "auth_user_linked_to_id_foreign" foreign key ("linked_to_id") references "auth_user" ("id") on update cascade on delete set null;`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "user_auth" cascade;`);

    this.addSql(`alter table "auth_session" drop constraint "auth_session_user_id_foreign";`);

    this.addSql(`alter table "auth_session" add constraint "auth_session_user_id_foreign" foreign key ("user_id") references "auth_user" ("id") on update cascade;`);
  }

}
