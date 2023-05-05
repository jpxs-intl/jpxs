---@type Plugin
local plugin = ...
plugin.name = 'jpxsUploader'
plugin.author = 'jdb, FieriFerret, gart, Jpsh, noche'
plugin.description = 'Streams player info to the JPXS database'
plugin.version = 11

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

local enabled = false
local mute400 = false
local lastCheckTime = 0
local lastPostTime = 0
local elapsed = 0
local lastPostString = ''
local awaitingPlayers = {}

local serverId = ''
local key = ''

plugin.webserverconfig = {
    host = 'https://jpxs.international',
    pingPath = '/api/data/ping',
    initPath = '/api/data/init',
    joinPath = '/api/data/join',
    pingInterval = 15,
    maximumWaitTime = 120
}

-- load key
local f = io.open('.jpxs.key', 'r')
if f then
    key = f:read('*all')
    f:close()
    enabled = true
else
    plugin:warn('No JPXS key found. Please contact gart to get one.')
    plugin:warn('Join the discord at https://gart.sh/jpxs')
    plugin:warn('Disabling plugin.')
end

local function onResponse(res)
    if not enabled then return end

    if not res then
        plugin:warn('Request failed')
        return
    end

    hook.run('JPXSResponse', nil)

    if res.status < 200 or res.status > 299 then
        if res.status >= 400 and res.status <= 599 and res.status ~= 429 then
            if mute400 then return end
            mute400 = true
            plugin:warn(
                'There are client problems, further 4XX and 5XX problems will be muted.')
        end
        plugin:warn('JXPS Error ' .. res.status .. ': ' .. res.body)
        return
    end
end

plugin:addEnableHandler(function()
    if not plugin.isEnabled then return end
    local initBody = {
        name = server.name,
        icon = plugin.serverSettings.icon,
        description = plugin.serverSettings.description,
        link = plugin.serverSettings.link,
        port = server.port,
        gameType = server.type,
        version = plugin.version,
        bans = {}
    }

    for _, acc in ipairs(accounts.getAll()) do
        if acc.banTime > 0 then
            table.insert(initBody.bans,
                         {name = acc.name, subRosaId = acc.subRosaID})
        end
    end

    hook.run('PreJPXSInit', initBody)

    initBody.auth = key
    local initString = json.encode(initBody)

    http.post(plugin.webserverconfig.host, plugin.webserverconfig.initPath, {},
              initString, 'application/json', function(httpRequestReturn)
        if not enabled then return end
        if (not httpRequestReturn or httpRequestReturn.status ~= 200) then
            plugin:warn('Failed to load, init failed')
            return
        end
        local body = json.decode(httpRequestReturn.body)
        print(httpRequestReturn.body)
        serverId = body.serverId
        plugin:print('Init successful! Server ID: ' .. serverId)

        if body.updateAvailable then
            plugin:print("New update available! Current: " .. plugin.version ..
                             " => Latest: " .. body.latestVersion)
            plugin:print("Get it at https://jpxs.international/download")
        end
    end)

end)

-- join

plugin:addHook("PostPlayerCreate", function(ply)
    if not enabled then return end
    awaitingPlayers[ply.index] = true
end)

-- ping

plugin:addHook("Logic", function()
    if not enabled then return end
    elapsed = elapsed + (1 / server.TPS)

    if elapsed >= plugin.webserverconfig.pingInterval then
        elapsed = 0

        local uptime = os.realClock()

        local body = {
            auth = key,
            players = {},
            uptime = uptime,
            serverId = serverId
        }

        for _, ply in pairs(players.getNonBots()) do

            table.insert(body.players, {
                subRosaId = ply.account.subRosaID,
                team = ply.team,
                corp = ply.corporateRating,
                money = ply.money
            })
        end

        hook.run('PreJPXSPing', body)

        local postString = json.encode(body)

        if postString == lastPostString and uptime - lastPostTime <
            plugin.webserverconfig.maximumWaitTime then return end
        lastPostTime = uptime
        lastPostString = postString
        if (plugin.config.enablePingMessage) then plugin:print('Ping!') end

        http.post(plugin.webserverconfig.host, plugin.webserverconfig.pingPath,
                  {}, postString, 'application/json', onResponse)

    end

    -- handle incoming players

    for index, _ in pairs(awaitingPlayers) do

        local ply = players[index]

        if ply.isBot then
            awaitingPlayers[index] = nil
            return
        end

        local body = {
            auth = key,
            serverId = serverId,
            name = ply.name,
            phoneNumber = ply.phoneNumber,
            steamId = ply.account.steamID,
            gameId = ply.account.subRosaID,
            hashedIp = ply.connection.address,
            gender = ply.gender,
            head = ply.head,
            skinColor = ply.skinColor,
            hairColor = ply.hairColor,
            hair = ply.hair,
            eyeColor = ply.eyeColor
        }

        ply.data.jpxsDataReady = false

        local postString = json.encode(body)

        http.post(plugin.webserverconfig.host, plugin.webserverconfig.joinPath,
                  {}, postString, 'application/json', function(res)
            if (not res or res.status ~= 200) then return end

            local body = json.decode(res.body)

            ply.data.isVpn = body.isVpn
            ply.data.country = body.country
            ply.data.countryCode = body.countryCode
            ply.data.timeZone = body.timeZone

            ply.data.nameHistory = body.nameHistory
            ply.data.alts = body.alts

            ply.data.jpxsDataReady = true

            hook.run('JPXSDataReady', ply)

            onResponse(res)
        end)

        awaitingPlayers[index] = nil
    end

end)

-- Commands

plugin.commands["/namehist"] = {
    info = "Check the previous names of a given user",
    usage = "name",
    call = function(ply, _, args)
        assert(#args >= 1, "usage")
        local option = string.lower(args[1])
        local target = findOnePlayer(option)
        assert(target, "Invalid player")
        if target and target.data.nameHistory ~= nil then
            ply:sendMessage(string.format("%s's name history:", target.name))
            for i = 1, #target.data.nameHistory do
                ply:sendMessage(string.format("Name %s : %s", i,
                                              target.data.nameHistory[i]))
            end
        end
    end
}

plugin.commands["/isvpn"] = {
    info = "Check if a given user is using a VPN",
    usage = "name",
    canCall = function(ply) return ply.isAdmin or ply.isConsole end,
    call = function(ply, _, args)
        assert(#args >= 1, "usage")
        local option = string.lower(args[1])
        local target = findOnePlayer(option)
        assert(target, "Invalid player")
        if not target or not target.data.jpxsDataReady then
            ply:sendMessage("Data not ready yet, try again in a few seconds")
            return
        end
        if target and target.data.isVpn ~= nil then
            ply:sendMessage(string.format("%s %s using a VPN | Country: %s",
                                          target.name, target.data.isVpn and
                                              "is" or "is not",
                                          target.data.country))
        end
    end
}
