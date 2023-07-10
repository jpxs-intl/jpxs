---@type jpxs
local jpxs = ...
jpxs._version = 15

local json = require 'main.json'

local worker
local workerPending = 0

local requestQueue = {}

---@type table<number, boolean>
local awaitingPlayers = {}
local elapsed = 0

local startTime = os.clock()

---@type table<string, {isBanned: boolean, banMessage: string}>
local bans = {}

local webserverconfig = {
    host = jpxs.overrides.host or 'https://jpxs.international',
    pingPath = jpxs.overrides.pingPath or '/api/data/ping',
    initPath = jpxs.overrides.initPath or '/api/data/init',
    joinPath = jpxs.overrides.joinPath or '/api/data/join',
    pingInterval = jpxs.overrides.pingInterval or 15,
    maximumWaitTime = jpxs.overrides.maximumWaitTime or 120,
    contentType = jpxs.overrides.contentType or 'application/json',
}

local workerPath = jpxs.overrides.workerPath or 'main/jpxs.worker.lua'

-- load worker script into main/jpxsWorker.lua
jpxs.workerString =
"-- JPXS WORKER SCRIPT\n-- Used to prevent worker errors\n\nrequire 'main.util'\n\n---@param message string\nlocal function handleMessage (message)\n     local method, callbackIndex, scheme, path, numHeaders, pos = ('znssn'):unpack(message)\n\n        local headers = {}\n      for _ = 1, numHeaders do\n              local key, value\n                       key, value, pos = ('ss'):unpack(message, pos)\n          headers[key] = value\n           end\n\n  ---@type HTTPResponse?\n        local res\n     if method == 'POST' then\n       local body, contentType = ('ss'):unpack(message, pos)\n          res = http.postSync(scheme, path, headers, body, contentType)\n   else\n          res = http.getSync(scheme, path, headers)\n       end\n\n local serialized = ('ni1'):pack(callbackIndex, res and 1 or 0)\nif res then\n            serialized = serialized .. ('nsn'):pack(res.status, res.body, table.numElements(res.headers))\n           for key, value in pairs(res.headers) do\n        serialized = serialized .. ('ss'):pack(key, value)\n             end\n   end\n\n          sendMessage(serialized)\nend\n\nwhile true do\n  while true do\n         local message = receiveMessage()\n                if not message then\n                   break\n          end\n\n          handleMessage(message)\n        end\n\n if sleep(100) then\n             break\n  end\nend"

local w = io.open(workerPath, 'w')
w:write(jpxs.workerString)
w:close()

---@param method string
---@param scheme string
---@param path string
---@param headers table<string, string>
---@param body? string
---@param contentType? string
---@param callback fun(response?: HTTPResponse)
local function request(method, scheme, path, headers, body, contentType, callback)
    local index = #requestQueue + 1

    local serialized = ('znssn'):pack(method, index, scheme, path, table.numElements(headers))
    for key, value in pairs(headers) do
        serialized = serialized .. ('ss'):pack(key, value)
    end

    if method == 'POST' then
        serialized = serialized .. ('ss'):pack(body, contentType)
    end

    table.insert(requestQueue, {
        serialized = serialized,
        callback = callback,
    })

    workerPending = workerPending + 1
    worker:sendMessage(serialized)
end

---@param message string
local function handleMessage(message)
    local callbackIndex, hasResponse, pos = ('ni1'):unpack(message)

    ---@type HTTPResponse?
    local res
    if hasResponse == 1 then
        res = {}
        local status, body, numHeaders
        status, body, numHeaders, pos = ('nsn'):unpack(message, pos)
        res.status = status
        res.body = body

        local headers = {}
        for _ = 1, numHeaders do
            local key, value
            key, value, pos = ('ss'):unpack(message, pos)
            headers[key] = value
        end

        res.headers = headers
    end

    local callback = requestQueue[callbackIndex].callback
    if callback then
        callback(res)
    end

    requestQueue[callbackIndex] = nil
end

---Send an HTTP(S) GET request asynchronously.
---@param scheme string The hostname of the server to send the request to, with optional protocol and port. Ex. google.com, https://google.com, https://google.com:443
---@param path string The path to request from the server.
---@param headers table<string, string> The table of request headers.
---@param callback fun(response?: HTTPResponse) The function to be called when the response is received or there was an error.
function jpxs.get(scheme, path, headers, callback)
    request('GET', scheme, path, headers, nil, nil, callback)
end

---Send an HTTP(S) POST request asynchronously.
---@param scheme string The hostname of the server to send the request to, with optional protocol and port. Ex. google.com, https://google.com, https://google.com:443
---@param path string The path to request from the server.
---@param headers table<string, string> The table of request headers.
---@param body string The request body.
---@param contentType string The request body MIME type.
---@param callback fun(response?: HTTPResponse) The function to be called when the response is received or there was an error.
function jpxs.post(scheme, path, headers, body, contentType, callback)
    request('POST', scheme, path, headers, body, contentType, callback)
end

---@param res HTTPResponse
function jpxs:handleResponse(res)

    ---@TODO handle instruction system

end

function jpxs:init()
    --- Init

    local initBody = {
        name = server.name,
        icon = jpxs.serverInfo.icon,
        description = jpxs.serverInfo.description,
        link = jpxs.serverInfo.link,
        port = server.port,
        gameType = server.type,
        version = jpxs._version,
        bans = {}
    }

    for _, acc in ipairs(accounts.getAll()) do
        if acc.banTime > 0 then
            table.insert(initBody.bans,
                { name = acc.name, subRosaId = acc.subRosaID })
        end
    end

    hook.run('PreJPXSInit', initBody)

    initBody.auth = jpxs.key
    local initString = json.encode(initBody)

    jpxs.post(webserverconfig.host, webserverconfig.initPath, {},
        initString, webserverconfig.contentType, function(httpRequestReturn)
            if not jpxs.enabled then return end
            if (not httpRequestReturn or httpRequestReturn.status ~= 200) then
                jpxs:print('Failed to load, init failed')
                return
            end
            local body = json.decode(httpRequestReturn.body)
            jpxs.serverId = body.serverId

            if (body.status == 'error') then
                jpxs:print('Error: ' .. body.error)
            end

            if (jpxs.serverId == nil) then
                jpxs:print('Init failed. Could not find server ID')
            else
                jpxs:print('Init successful! Server ID: ' .. jpxs.serverId)
            end

            if body.bans then
                bans = body.bans
            end

            jpxs:handleResponse(httpRequestReturn)
        end)
end

function jpxs.handleIncomingPlayers()
    for index, _ in pairs(awaitingPlayers) do
        local ply = players[index]

        if ply.isBot or ply.connection == nil then
            awaitingPlayers[index] = nil
            return
        end

        local body = {
            auth = jpxs.key,
            serverId = jpxs.serverId,
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

        jpxs.post(webserverconfig.host, webserverconfig.joinPath,
            {}, postString, webserverconfig.contentType, function(res)
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

                jpxs:handleResponse(res)
            end)

        awaitingPlayers[index] = nil
    end
end

--- Send a ping to the JPXS server.
function jpxs:ping()
    if not jpxs.enabled then return end
    if not jpxs.serverId then return end

    local body = {
        players = {},
        uptime = math.floor(os.clock() - startTime),
        serverId = jpxs.serverId
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

    body.auth = jpxs.key

    local postString = json.encode(body)
    jpxs.post(webserverconfig.host, webserverconfig.pingPath,
        {}, postString, webserverconfig.contentType, jpxs.handleResponse)
end

---@param info serverInfo
function jpxs:setInfo(info)
    jpxs.serverInfo = info
end

jpxs.plugin:addHook(
    'Logic',
    function()
        -- worker management

        if workerPending ~= 0 then
            while true do
                local message = worker:receiveMessage()
                if not message then
                    break
                end

                handleMessage(message)
                workerPending = workerPending - 1
            end
        end

        --- ping management

        if not jpxs.enabled then return end
        elapsed = elapsed + (1 / server.TPS)

        if elapsed >= webserverconfig.pingInterval then
            elapsed = 0
            jpxs:ping()
        end


        --- player management
        jpxs:handleIncomingPlayers()
    end
)


jpxs.plugin:addHook("PostPlayerCreate", function(ply)
    if not jpxs.enabled then return end
    awaitingPlayers[ply.index] = true
end)

jpxs.plugin:addHook(
    "PostAccountTicket",
    ---@param acc Account
    function(acc)
        if not acc then
            return
        end

        local banTime = acc.banTime
        if banTime > 0 then
            hook.once("SendConnectResponse", function(_, _, data)
                -- 100 years
                if banTime > 52596000 then
                    data.message = jpxs.plugin.config.permaFormatString
                else
                    data.message = string.format(jpxs.plugin.config.formatString, banTime)
                end
            end)
        elseif bans[acc.subRosaID].isBanned then
            hook.once("SendConnectResponse", function(_, _, data)
                -- 100 years
                if bans[acc.subRosaID].banMessage then
                    data.message = bans[acc.subRosaID].banMessage
                else
                    data.message = ""
                end
            end)
        end
    end
)


-- start needed threads
worker = Worker.new(workerPath)

-- Start everything
jpxs:init()

-- Commands

jpxs.plugin.commands["/namehist"] = {
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

jpxs.plugin.commands["/isvpn"] = {
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
