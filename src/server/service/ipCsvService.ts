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
      populate: ["users"],
    }
  );

  let csv = "ip, user\n";

  ips.forEach((ip) => {
    ip.users.getItems().forEach((user) => {
      csv += `${ip.ip}, ${Util.formatPhoneNumber(user.phoneNumber)}\n`;
    });
  });

  fs.writeFileSync("ips.csv", csv);
});
