import { db } from "../..";
import { User } from "../../database/entities/user.entity";
import UpdateableCache from "./cache/updateableCache";

export default class CacheStorage {
  public static users: UpdateableCache<User, number> = new UpdateableCache<User, number>(async (key: number) => {
    const user = await db.getEntityManager().findOne(User, {
      phoneNumber: key,
    });

    if (user) {
      return user;
    }
    return undefined;
  });
}
