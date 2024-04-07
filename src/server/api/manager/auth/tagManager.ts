import { Logger } from "../../../../utils/logger";
import Core from "../../../core";
import { Tag } from "../../../database/entities/tag.entity";
import { DatabaseChannel } from "../../../messaging/channels/database";

export default class TagManager {
    public static readonly clientId = "jpxs.TagManager";
    public static tags: Record<string, Tag> = {}
    public static logger = Logger.create("TagManager");

    public static async init() {
        DatabaseChannel.subscribeToEvent(this.clientId, "database:initialized", async () => {
            const [tags, count] = await Core.db.em.findAndCount(Tag, {})
            tags.forEach(tag => {
                this.tags[tag.id] = tag
            })

            this.logger.info(`Loaded ${count} tags`)
        })
    }

}