"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20230423025355 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20230423025355 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "token" ("id" varchar(255) not null, "token" varchar(255) not null, "refresh_token" varchar(255) not null, "expires_at" timestamptz(0) not null, "user_phone_number" int not null, constraint "token_pkey" primary key ("id"));');
        this.addSql('alter table "token" add constraint "token_user_phone_number_unique" unique ("user_phone_number");');
        this.addSql('alter table "token" add constraint "token_user_phone_number_foreign" foreign key ("user_phone_number") references "user" ("phone_number") on update cascade;');
        this.addSql('alter table "name_history" alter column "name" drop default;');
        this.addSql('alter table "name_history" alter column "name" type varchar(255) using ("name"::varchar(255));');
    }
    async down() {
        this.addSql('drop table if exists "token" cascade;');
        this.addSql('alter table "name_history" alter column "name" type varchar using ("name"::varchar);');
        this.addSql('alter table "name_history" alter column "name" set default \'\';');
    }
}
exports.Migration20230423025355 = Migration20230423025355;
//# sourceMappingURL=Migration20230423025355.js.map