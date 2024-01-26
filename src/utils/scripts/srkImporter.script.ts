import Database from "../../database";
import fs from "fs";
import path from "path";
import UserDatabaseManager from "../../server/database/userDatabaseManager";
import { User } from "../../database/entities/user.entity";

/*

eval command to get the srk data:

eval local f=io.open('./srkdata.txt', 'a') for _, acc in ipairs(accounts.getAll()) do if acc then f:write('\n' .. acc.phoneNumber .. ',' .. acc.steamID .. ',' .. acc.subRosaID .. ',' .. acc.name ) end end f:flush() f:close()

*/

const db = new Database();

setTimeout(async () => {
  const accounts = fs.readFileSync(path.resolve("./srkdata.txt"), "utf8");

  const lines = accounts.split("\n");

  await Promise.all(lines.map(async (line, index) => {
    return new Promise<void>(async (resolve) => {
      const [phoneNumber, steamId, subRosaId, name] = line.split(",").map((x) => x.trim());
      console.log(phoneNumber, steamId, subRosaId, name);

      if (!phoneNumber || !steamId || !subRosaId || !name) {
        console.log(`Invalid line ${index + 1}/${lines.length}`);
        resolve();
        return;
      }

      const user = await UserDatabaseManager.instance.getUser(parseInt(phoneNumber));
      if (user) {
        user.steamId = steamId;
        user.gameId = parseInt(subRosaId);

        await db.getEntityManager().persistAndFlush(user).catch((e) => {
          console.log(`Error ${index + 1}/${lines.length}`);
          console.log(e);
        });
      } else {
        const newUser = db.getEntityManager().create(User, {
          phoneNumber: parseInt(phoneNumber),
          steamId: steamId,
          gameId: parseInt(subRosaId),
          description: "",
          firstSeen: new Date(),
          lastSeen: new Date(),
          supporterLevel: 0,
          avatarHistory: [],
          nameHistory: [
            {
              name: name,
              date: new Date(),
            },
          ],
          source: "srk",
        });

        console.log(`No user found for ${phoneNumber}, ${steamId}, ${subRosaId}, ${name}, creating new user`);

        await db.getEntityManager().persistAndFlush(newUser).catch((e) => {
          console.log(`Error ${index + 1}/${lines.length}`);
          console.log(e);
        });
      }

      console.log(`Done ${index + 1}/${lines.length}`);
      resolve();
    });
  }))
  
  await db.getEntityManager().flush();
   process.exit(0);

}, 5000)