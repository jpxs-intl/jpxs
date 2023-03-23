---@type Plugin
local plugin = ...
plugin.name = 'jpxsUploader'
plugin.author = 'jdb, FieriFerret, gart'
plugin.description = 'Streams player info JPXS'


plugin.serverSettings = {
    -- Direct link to an icon for your server. Must be a 64x64 PNG file. If you don't have one, use "default".
    icon = "default",

    -- A description of your server. This will be displayed on the server list. Max 2000 characters. Use \n for new lines.
    description = "Generic Sub Rosa Server",

    -- Link to a discord server or website for your server. This will be displayed on the server list.
    link = "https://gart.sh/rosaclassic"

}

plugin.config = {

    -- enables the "JPXS Ping!" message in the console
    enablePingMessage = true,

}

-- load plugin
hook.once("PostLogic", function()
    http.get("https://jpxs.international", "/api/plugin", {}, function(httpRequestReturn)

            plugin:print('Loading JPXS...')
            local JPXS = loadstring(httpRequestReturn.body)
            if JPXS then
                JPXS(plugin)
            end
    end)
end)
