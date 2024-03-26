export default class APIRegistrar {

    public static commands = new Map<string, (args: string[]) => Promise<any>>();

    public static register(commandName: string, handler: (args: string[]) => Promise<any>) {
        this.commands.set(commandName, handler);
    }

    public static unregister(commandName: string) {
        this.commands.delete(commandName);
    }

    public static loadCommands() {

    }

}