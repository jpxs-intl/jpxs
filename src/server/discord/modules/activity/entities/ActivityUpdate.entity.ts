import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";
import { ClientPresenceStatus, PresenceStatus } from "discord.js";
import { ActivityUser } from "./ActivityUser.entity";

@Entity()
export class ActivityUpdate {

    @PrimaryKey()
    id: string = cuid();


    @Property({
        nullable: false
    })
    activity: PresenceStatus

    @Property()
    desktopStatus: PresenceStatus = "offline"

    @Property()
    mobileStatus: PresenceStatus = "offline"

    @Property()
    webStatus: PresenceStatus = "offline"

    @ManyToOne({
        entity: () => ActivityUser,
        inversedBy: "updates"
    })
    user: ActivityUser

    @Property()
    timestamp: Date = new Date()
    

    constructor(activity: PresenceStatus, user: ActivityUser, platformStatus?: {
        desktop?: ClientPresenceStatus,
        mobile?: ClientPresenceStatus,
        web?: ClientPresenceStatus
    }) {
        this.activity = activity;
        this.user = user;
    }
}