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

plugin.defaultConfig = {
    -- enables the "JPXS Ping!" message in the console
    enablePingMessage = true
}

local json = require 'main.json'

local mute400 = false
local lastCheckTime = 0
local lastPostTime = 0
local elapsed = 0
local lastPostString = ''
local serverId = ''

plugin.webserverconfig = {
    host = 'https://jpxs.international',
    pingPath = '/api/data/ping',
    initPath = '/api/data/init',
    joinPath = '/api/data/join',
    pingInterval = 5,
    maximumWaitTime = 5
}

local function onResponse(res)
    if not plugin.isEnabled then return end

    if not res then
        plugin:warn('Request failed')
        return
    end

    if res.status < 200 or res.status > 299 then
        if res.status >= 400 and res.status <= 499 and res.status ~= 429 then
            if mute400 then return end
            mute400 = true
            plugin:warn(
                'There are client problems, further 4XX problems will be muted.')
        end
        plugin:warn('JXPS Error ' .. res.status .. ': ' .. res.body)
        return
    end
end

plugin:addEnableHandler(function()
    local initBody = {
        name = server.name,
        icon = plugin.serverSettings.icon,
        description = plugin.serverSettings.description,
        link = plugin.serverSettings.link,
        port = server.port,
        gameType = server.type,
        bans = {}
    }

    for _, acc in ipairs(accounts.getAll()) do
        if acc.banTime > 0 then
            table.insert(initBody.bans,
                         {name = acc.name, subRosaId = acc.subRosaID})
        end
    end

    local initString = json.encode(initBody)

    http.post(plugin.webserverconfig.host, plugin.webserverconfig.initPath, {},
              initString, 'application/json', function(httpRequestReturn)
        if (not httpRequestReturn or httpRequestReturn.status ~= 200) then
            plugin:warn('Failed to load, init failed')
            return
        end
        local body = json.decode(httpRequestReturn.body)
        serverId = body.serverId
        plugin:print('Init successful! Server ID: ' .. serverId)
    end)

end)

plugin:addHook("PostResetGame", function()
    if not plugin.isEnabled then return end
    init()
end)

-- join

plugin:addHook("PostPlayerCreate", function(ply)

    local body = {
        serverId = serverId,
        name = ply.name,
        phoneNumber = ply.phoneNumber,
        steamId = ply.account.steamID,
        hashedIp = crypto.md5(ply.connection.address),
        gender = ply.gender,
        head = ply.head,
        skinColor = ply.skinColor,
        hairColor = ply.hairColor,
        hair = ply.hair,
        eyeColor = ply.eyeColor
    }

    local postString = json.encode(body)

    http.post(plugin.webserverconfig.host, plugin.webserverconfig.joinPath, {},
              postString, 'application/json', onResponse)

end)

-- ping

plugin:addHook("Logic", "jpxsUploader", function()
    elapsed = elapsed + (1 / server.TPS)

    if elapsed >= plugin.webserverconfig.pingInterval then
        elapsed = 0

        local uptime = os.realClock()

        local body = {players = {}, uptime = uptime, serverId = serverId}

        for _, ply in pairs(players.getNonBots()) do

            table.insert(body.players, {
                subRosaId = ply.account.subRosaID,
                team = ply.team,
                corp = ply.corporateRating,
                money = ply.money
            })
        end

        local postString = json.encode(body)

        if postString == lastPostString and uptime - lastPostTime <
            plugin.webserverconfig.maximumWaitTime then return end
        lastPostTime = uptime
        lastPostString = postString
        if (plugin.config.enablePingMessage) then plugin:info('Ping!') end

        http.post(plugin.webserverconfig.host, plugin.webserverconfig.pingPath,
                  {}, postString, 'application/json', onResponse)

    end

end)
