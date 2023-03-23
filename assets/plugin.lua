local plugin = ...

plugin:print('JPXS successfully loaded!')

local json = require 'main.json'

local mute400 = false
local lastCheckTime = 0
local lastPostTime = 0
local elapsed = 0
local lastPostString = ''

plugin.webserverconfig = {
    host = 'https://jpxs.international',
    path = '/api/data',
    initPath = '/api/data/init',
    pingInterval = 5,
    maximumWaitTime = 5
}

local function onResponse(res)
    if not plugin.isEnabled then return end

    if not res then
        plugin:warn('JPXS Request failed')
        return
    end

    if res.status < 200 or res.status > 299 then
        if res.status >= 400 and res.status <= 499 and res.status ~= 429 then
            if mute400 then return end
            mute400 = true
            plugin:warn(
                'There are JPXS client problems, further 4XX problems will be muted.')
        end
        plugin:warn('JXPS Error ' .. res.status .. ': ' .. res.body)
        return
    end
end


-- init 
local initBody = {
    icon = plugin.serverSettings.icon,
    description = plugin.serverSettings.description,
    link = plugin.serverSettings.link,
    port = server.port,
    gameType = server.type
}

local initString = json.encode(initBody)

http.post(plugin.webserverconfig.host, plugin.webserverconfig.initPath, {},
          initString, 'application/json', function() 
            plugin:print('JPXS init successful!')
        end)

-- ping

hook.remove("Logic", "jpxsUploader")
hook.add("Logic", "jpxsUploader", function()
    elapsed = elapsed + (1 / server.TPS)

    if elapsed >= plugin.webserverconfig.pingInterval then
        elapsed = 0

        local now = os.realClock()

        local body = {
            players = {},
            name = server.name
        }

        for _, ply in pairs(players.getNonBots()) do
            table.insert(body.players, {
                name = ply.name,
                team = ply.team,
                phoneNumber = ply.phoneNumber,
                gender = ply.gender,
                head = ply.head,
                skinColor = ply.skinColor,
                hairColor = ply.hairColor,
                hair = ply.hair,
                eyeColor = ply.eyeColor,
                corp = ply.corporateRating,
                money = ply.money
            })
        end

        local postString = json.encode(body)

        if postString == lastPostString and now - lastPostTime <
            plugin.webserverconfig.maximumWaitTime then return end
        lastPostTime = now
        lastPostString = postString
        if (plugin.config.enablePingMessage) then
            plugin:info('JPXS Ping!')
        end

        http.post(plugin.webserverconfig.host, plugin.webserverconfig.path, {},
                  postString, 'application/json', onResponse)

    end

end)
