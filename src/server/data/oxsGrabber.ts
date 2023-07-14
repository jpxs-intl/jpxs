import fetch from "node-fetch";
import { User } from "../../database/entities/user.entity";
import ConvertPhone from "../../utils/convertPhone";
import { NameHistory } from "../../database/entities/nameHistory.entity";
import { Avatar } from "../../database/entities/avatar.entity";
import { AvatarHistory } from "../../database/entities/avatarHistory.entity";
import { db } from "../..";
import Logger from "../../utils/logger";
export default class OXSGrabber {
  public static async getPlayer(phoneNumber: number) {
    const res = await fetch(`https://oxs.international/api/v1/accounts/${phoneNumber}`);

    if (res.status != 200) {
        Logger.warn("OXS", `Failed to grab ${phoneNumber} from OXS, got ${res.status}`);
        return undefined;
    }

    const json = (await res.json()) as OXSAccount;

    const gameId = ConvertPhone.get(phoneNumber);
    if (!gameId) {
        Logger.warn("OXS", `Failed to grab ${phoneNumber} from OXS, no gameid found`);
        return undefined;
    }

    const user = new User({
      phoneNumer: phoneNumber,
      gameId: gameId,
    });

    user.firstSeen = new Date(json.firstSeen);
    user.lastSeen = new Date(json.lastSeen);

    if (!user.nameHistory.isInitialized()) await user.nameHistory.init();

    json.nameUsages.forEach((usage) => {
      const history = new NameHistory(usage.name, user);
      history.date = new Date(usage.firstSeen);
      user.nameHistory.add(history);
    });

    if (!user.avatarHistory.isInitialized()) await user.nameHistory.init();

    json.avatars.forEach((avatar) => {
      const nAvatar = new Avatar({
        sex: avatar.gender == "f" ? 0 : 1,
        eyes: avatar.eyeColor,
        hair: avatar.hair,
        hairColor: avatar.hairColor,
        head: avatar.head,
        skin: avatar.skinColor,
      });
      const history = new AvatarHistory(nAvatar, user);
      user.avatarHistory.add(history);
    });

    user.source = "OXS";

    await db.em.persistAndFlush(user)

    Logger.log("OXS", `Grabbed ${phoneNumber} from OXS`);

    return user
  }
}

interface OXSAccount {
  firstSeen: number;
  lastSeen: number;
  id: number;
  name: string;
  nameUsages: OXSNameUsage[];
  avatars: OXSAvatar[];
}

interface OXSAvatar {
  firstSeen: number;
  lastSeen: number;
  gender: "m" | "f";
  head: number;
  skinColor: number;
  hairColor: number;
  hair: number;
  eyeColor: number;
}

interface OXSNameUsage {
  firstSeen: number;
  lastSeen: number;
  name: string;
}
