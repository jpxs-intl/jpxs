import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Suggestion {

    @PrimaryKey({
        autoincrement: true,
    })
    public id!: number;

    @Property({
        type: "text",
    })
    public suggestion!: string;

    @Property()
    public authorId!: string;

    @Property()
    public messageId!: string;

    @Property({
        nullable: true,
    })
    public threadId?: string;

    @Property()
    public upvoters!: string[];

    @Property()
    public downvoters!: string[];

    @Enum(() => SuggestionStatus)
    public status!: SuggestionStatus;

    @Property()
    public reason!: string;

    @Property()
    public createdAt!: Date;

}

export enum SuggestionStatus {
    Open,
    Pending,
    Accepted,
    Denied,
    Deleted
}