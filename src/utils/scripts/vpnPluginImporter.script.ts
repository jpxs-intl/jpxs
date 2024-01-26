import Database from "../../database";
import fs from "fs";
import path from "path";
import UserDatabaseManager from "../../server/database/userDatabaseManager";

const db = new Database();


setTimeout(async () => {
  const altips = JSON.parse(fs.readFileSync(path.resolve("./ALTIPS.json"), "utf8")) as {
    Account: number[];
    IP: string[];
  };

  console.log(`Loaded ${altips.Account.length} accounts`)

  for (let i = 250; i < altips.Account.length; i++) {
    const account = altips.Account[i];
    const ip = altips.IP[i];

    const user = await UserDatabaseManager.instance.getUser(account);
    if (user) {
      await UserDatabaseManager.instance.catchIp(user, {
        ip: ip,
        location: {
          latitude: "0",
          longitude: "0",
          country: "",
          country_code: "",
          time_zone: "",
        },
        security: {
          proxy: false,
          vpn: false,
        },
      });
    } else {
      console.log(`No user found for ${account}`);
    }

    await new Promise((res) => setTimeout(res, 200));

    console.log(`Done ${i}/${altips.Account.length}`);
  }
}, 5000);
