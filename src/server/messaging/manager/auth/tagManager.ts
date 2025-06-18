import { Logger } from "../../../../utils/logger.js";
import Core from "../../../core.js";
import { Tag } from "../../../../database/entities/tag.entity.js";
import { DatabaseChannel } from "../../channels/database.js";

export default class TagManager {
    public static readonly clientId = "jpxs.TagManager";
    public static tags: Record<string, Tag> = {}
    public static logger = Logger.create("TagManager");

    public static async init() {
        DatabaseChannel.subscribeToEvent(this.clientId, "database:initialized", async () => {
            const [tags, count] = await Core.services.tag.findAndCount({})
            tags.forEach(tag => {
                this.tags[tag.id] = tag
            })

            this.logger.info(`Loaded ${count} tags`)
        })
    }

}