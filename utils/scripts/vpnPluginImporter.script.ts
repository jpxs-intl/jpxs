import Database from "../../database";
import fs from "fs";
import path from "path";
import UserDatabaseManager from "../../server/database/userDatabaseManager";

const db = new Database(async () => {
  const altips = JSON.parse(fs.readFileSync(path.resolve("./ALTIPS.json"), "utf8")) as {
    Account: number[];
    IP: string[];
  };

  altips.Account.forEach(async (account, index) => {
    const ip = altips.IP[index];

    const user = await UserDatabaseManager.instance.getUser(account);
    if (user) {
      await UserDatabaseManager.instance.catchIp(user, {
        ip: ip,
        latitude: undefined,
        longitude: undefined,
      });

    } else {
        console.log(`No user found for ${account}`);
    }

    console.log(`Done ${index}/${altips.Account.length}`);
  });
});
