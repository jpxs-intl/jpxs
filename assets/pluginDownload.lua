---@type Plugin
local plugin = ...
plugin.name = 'jpxsUploader'
plugin.author = 'jdb, FieriFerret, gart, Jpsh'
plugin.description = 'Streams player info to the JPXS database'

plugin.serverSettings = {
    -- Direct link to an icon for your server. Must be a 64x64 PNG file. If you don't have one, use "default".
    icon = "default",

    -- A description of your server. This will be displayed on the server list. Max 2000 characters. Use \n for new lines.
    description = "Generic Sub Rosa Server",

    -- Link to a discord server or website for your server. This will be displayed on the server list.
    link = "https://gart.sh/jpxs"

}

plugin.config = {
    -- enables the "JPXS Ping!" message in the console
    enablePingMessage = true
}

-- load plugin | do not change this

plugin:addEnableHandler(function()
    plugin:print('JPXS enabled')
    hook.once('PostLogic', function (isReload)
        if isReload then return end
        plugin:print('Loading JPXS...')
        http.get("https://jpxs.international", "/api/plugin", {}, function (httpRequestReturn)
            plugin:print('JPXS response received')
            if (not httpRequestReturn or httpRequestReturn.status ~= 200) then
                plugin:warn('Failed to load JPXS, download failed')
                return
            end
            local JPXS = loadstring(httpRequestReturn.body)
            print(httpRequestReturn.body)
            if JPXS then
                plugin:print('JPXS loaded, starting...')
                JPXS(plugin)
            else
                plugin:warn('Failed to load JPXS, invalid response')
            end
        end)
    end)
end)

