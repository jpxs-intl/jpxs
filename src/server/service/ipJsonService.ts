import Database from "../../database";
import { config } from "dotenv";
import Logger from "../../utils/logger";
import { User } from "../../database/entities/user.entity";
import fs from "fs";
import { Ip } from "../../database/entities/ip.entity";
import Util from "../../utils/util";

config();

const db = new Database(async () => {
  const ips = await db.em.find(
    Ip,
    {},
    {
      populate: ["users", "users.nameHistory"],
    }
  );

  let out: {
    [ip: string]: string;
  } = {};

  ips.forEach((ip) => {
    ip.users.getItems().forEach(async (user) => {
      if (!out[ip.ip]) {
        if (!user.nameHistory[0]) return;
        out[ip.ip] = user.nameHistory.getItems().sort((a, b) => b.date.getTime() - a.date.getTime())[0].name;
      }
    });
  });

  fs.writeFileSync("ips.json", JSON.stringify(out));
});
