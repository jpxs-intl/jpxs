import { Logger } from "./logger";

export default class NodeMatch {

    private static logger = Logger.create("NodeMatch");

    /**
     * Perform a node-based match on a list of strings
     * @param str the key to match (e.g. "*", "key.*", "key.*", "key.*.value", "key.**")
     * @param matches 
     */
    public static match(str: string, matches: string[]) {

        const parts = str.split(".");

        for (let match of matches) {
            const matchParts = match.split(".");

            let matches = true;
            for (let i = 0; i < parts.length; i++) {
                if (matchParts[i] === "**") {
                    this.logger.debug("Matched **, returning match");
                    break;
                }

                if (parts[i] === "*" || parts[i] === matchParts[i]) {
                    this.logger.debug(`Matched ${parts[i]} to ${matchParts[i]}`);
                    continue;
                }

                this.logger.debug(`Failed to match ${parts[i]} to ${matchParts[i]}`);
                matches = false;
                break;
            }

            if (matches) {
                this.logger.debug(`Matched ${str} to ${match}`);
                return match;
            }
        }

    }

}