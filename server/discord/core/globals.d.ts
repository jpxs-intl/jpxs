declare class Core {
  constructor(private _options?: Core.OnebotOptions);
  
  public start(): void;
}

declare namespace Core {

    /**
     * The options for the Onebot client.
     * @typedef {Object} OnebotOptions
     * @property {string} [token] The token of the bot.
     * @property {"selfhost" | "sharedhost"} [mode] The mode of the bot. Defaults to "selfhost". "Selfhost" is for self-hosted bots. "Sharedhost" is for the shared onebot instance and is not recommended for use. Will install all modules.
     * @property {"selfhost" | "sharedhost"} [webserverType]  The type of webserver to use. Selfhost requires the {@link @onebot/webserver}, module installed. Sharedhost will use the shared webserver. 
     * @property {string} [webserverUrl] The url of the webserver. Only required for {@link OnebotOptions.webserverType} "sharedhost".
     */
  export interface OnebotOptions {
    token: string;
    mode?:  "selfhost" | "sharedhost";
    webserverType?: "selfhost" | "sharedhost";
    selfhostWebserverAddress?: string;
  }
}

declare var Core: Core

