import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";

@Entity()
export class AuthUser {

    @PrimaryKey()
    id: string

    @Property()
    username: string

    @Property()
    token: string

    @Property({
        nullable: true
    })
    refreshToken?: string

    @Property()
    createdAt: Date = new Date()

    @Property({
        nullable: true
    })
    expiresAt?: Date

    @Property()
    scopes: string[] = []

    @ManyToOne(() => AuthUser, { nullable: true })
    linkedTo?: AuthUser

    constructor(userId: string, username: string, token: string, refreshToken?: string, scopes: string[] = [], expiresAt?: Date) {
        this.id = userId
        this.username = username
        this.token = token
        this.refreshToken = refreshToken
        this.scopes = scopes
        this.expiresAt = expiresAt

        if (this.scopes.length === 0) {
            this.scopes = ["identify"]
        }
    }

    public static fromDiscord(userId: string, username: string, token: string, refreshToken?: string, scopes: string[] = [], expiresAt?: Date) {
        const user = new AuthUser(`discord:${userId}`, username, token, refreshToken, scopes, expiresAt)
        return user
    }

    public static fromSteam(userId: string, username: string, token: string, refreshToken?: string, scopes: string[] = [], expiresAt?: Date) {
        const user = new AuthUser(`steam:${userId}`, username, token, refreshToken, scopes, expiresAt)
        return user
    }
}