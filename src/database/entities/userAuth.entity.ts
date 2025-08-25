import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import { User } from "./user.entity.js";

@Entity()
export class UserAuth {

    @PrimaryKey()
    authId: string

    @Property()
    username: string

    @Enum(() => AuthType)
    type: AuthType

    /**
     * For OAuth2, this is the access token
     * 
     * For password-based authentication, this is the hashed password
     */
    @Property({
        type: "text"
    })
    token: string

    /**
     * For OAuth2, this is for the refresh token
     * 
     * For password-based authentication, this is the salt 
     */
    @Property({
        nullable: true,
        type: "text"
    })
    token2?: string

    @ManyToOne({
        entity: () => User,
        inversedBy: "auth"
    })
    user: Rel<User>

    @Property()
    createdAt: Date = new Date()

    @Property({
        nullable: true
    })
    expiresAt?: Date

    @Property()
    scopes: string[] = []

    constructor(userId: string, username: string, type: AuthType, user: Rel<User>, token: string, token2?: string, scopes: string[] = [], expiresAt?: Date) {
        this.authId = userId
        this.username = username
        this.type = type
        this.token = token
        this.token2 = token2
        this.user = user
        this.scopes = scopes
        this.expiresAt = expiresAt

        if (this.scopes.length === 0) {
            this.scopes = ["identify"]
        }

        this.user.addAuth(this)
    }

    public get isExpired() {
        return this.expiresAt ? this.expiresAt < new Date() : false
    }

    public get platformId() {
        return this.authId.split(":")[1]
    }


    public static fromDiscord(user: User, userId: string, username: string, token: string, refreshToken: string, scopes: string[], expiresAt: Date) {
        const auth = new UserAuth(`discord:${userId}`, username, AuthType.Discord, user, token, refreshToken, scopes, expiresAt)
        return auth
    }





}

export enum AuthType {
    Discord,
    Steam
}

export const AuthTypeNames = {
    [AuthType.Discord]: "Discord",
    [AuthType.Steam]: "Steam"
}