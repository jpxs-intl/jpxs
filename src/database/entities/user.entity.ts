import { Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { UserAuth, AuthType } from "./userAuth.entity.js";
import Id from "../../utils/id.js";
import { AuthSession } from "./authSession.entity.js";
import { Player } from "./player.entity.js";
import Core from "../../server/core.js";


/**
 * My naming in this is kinda stupid, this is referring to a user by someone that is logged into the website.
 * This is different from a Player, which is someone who is logged into the game.
 */
@Entity()
export class User {

    @PrimaryKey()
    id: string = Id.get()

    @Property()
    displayName: string

    @OneToMany({
        entity: () => UserAuth,
        mappedBy: "user",
    })
    auth = new Collection<UserAuth>(this)

    @OneToMany({
        entity: () => UserAuth,
        mappedBy: "user",
    })
    accessTokens = new Collection<UserAuth>(this)

    @OneToMany({
        entity: () => AuthSession,
        mappedBy: "user",
    })
    sessions = new Collection<AuthSession>(this)

    @OneToOne({
        entity: () => Player,
        nullable: true
    })
    linkedTo?: Player

    @Property()
    createdAt: Date = new Date()

    constructor(displayName?: string, avatarUrl?: string) {
        this.displayName = displayName || this.id
    }

    public addAuth(auth: UserAuth) {
        this.auth.add(auth)
    }

    public async getAuth(authType: AuthType) {
        return await Core.services.em.findOne(UserAuth, {
            user: this,
            type: authType
        }) || undefined
    }
}