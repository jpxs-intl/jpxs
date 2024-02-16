--_jpxs.lua

-- ##############################################################
-- JPXS management, logging, and statistics plugin
--
-- if you're seeing this you're looking to tinker with this
-- please don't, it's literally months of work here and
-- I don't want it fucking with something on the server
-- thanks, gart
-- ##############################################################

---@class JPXS
---@field _version number
---@field _loaderVersion number
---@field plugin Plugin
---@field print(...)
---@field overrides table<string, string>
---@field key string
---@field enabled boolean
---@field debug boolean
local _jpxs = ...
_jpxs._version = 27

---@class Plugin
---@field name string The name of the plugin.
---@field author string The author of the plugin.
---@field description string The description of the plugin.
---@field hooks table<string, function>
---@field commands table<string, Command>
---@field defaultConfig table
---@field config table
---@field isEnabled boolean
---@field fileName string
---@field fullFileName string?
---@field doAutoReload boolean
---@field nameSpace string
---@field entryPath string

local name = _jpxs._loaderVersion == 3 and "PanelUtil" or "JPXS"

-- remove all hooks
hook.remove("Logic", _jpxs.plugin.name)
hook.remove("PostPlayerCreate", _jpxs.plugin.name)
hook.remove("AccountTicketFound", _jpxs.plugin.name)
hook.remove("ServerSend", _jpxs.plugin.name)

if _jpxs.serverInfo == nil then
	_jpxs.serverInfo = { description = "", link = "", icon = "" }
end

_jpxs:print(name .. " v" .. _jpxs._version .. " loaded successfully")

local json = require("main.json")

local worker
local workerPending = 0

local requestQueue = {}

---@type table<number, boolean>
local awaitingPlayers = {}
local elapsed = 0

local startTime = os.clock()
local currentMap = server.levelToLoad

---@type string[]
_jpxs.banlist = {}

_jpxs.tpsInfo = {
	sampleCounter = 0,
	sampleInterval = 100,
	lastSampleTime = os.realClock(),
	recent = 0,
}

local webserverconfig = {
	host = _jpxs.overrides.host or "https://jpxs.io",
	pingPath = _jpxs.overrides.pingPath or "/api/data/ping",
	initPath = _jpxs.overrides.initPath or "/api/data/init",
	joinPath = _jpxs.overrides.joinPath or "/api/data/join",
	logPath = _jpxs.overrides.logPath or "/api/data/log",
	verifyPath = _jpxs.overrides.verifyPath or "/api/data/verify",
	instructionPath = _jpxs.overrides.instructionPath or "/api/data/instruction",
	pingInterval = _jpxs.overrides.pingInterval or 15,
	contentType = _jpxs.overrides.contentType or "application/json",
}

---@class Instruction
---@field type string
---@field id string
---@field serverId string
---@field cb fun(success: boolean, res: string)
---@field hasSent boolean

_jpxs.instructionHandlers = {
	---@param instruction Instruction
	["EXEC"] = function(instruction)
		local func = load(instruction.code, instruction.id, "t")
		if func then
			local success, res = pcall(func, _jpxs, instruction.cb)
			return success, res
		end
	end,
	---@param instruction Instruction
	["REJOIN"] = function(instruction)
		for _, ply in pairs(players.getNonBots()) do
			awaitingPlayers[ply.index] = true
		end

		return true, string.format("Rejoined %d players", #players.getNonBots())
	end,
	---@param instruction Instruction
	["ANNOUNCE"] = function(instruction)
		if instruction.message == nil then
			return false, "No message provided"
		end

		if instruction.message == "" then
			return false, "Message cannot be empty"
		end

		chat.announceWrap(instruction.message)
		return true, "Announced message"
	end,
	---@param instruction Instruction
	["RELOAD"] = function(instruction)
		_jpxs.plugin:reload()
		return true, "Reloaded plugin"
	end,
	---@param instruction Instruction
	["KICK"] = function(instruction)
		if instruction.target == nil then
			return false, "No target provided"
		end

		---@type Player?
		local target = findOnePlayer(instruction.target)
		if target == nil then
			return false, "Invalid target"
		end

		target.connection.timeoutTime = 10000
		return true, "Kicked player"
	end,
	---@param instruction Instruction
	["SAVE"] = function(instruction)
		accounts.save()
		return true, "Saved accounts"
	end,
	---@param instruction Instruction
	["SHUTDOWN"] = function(instruction)
		accounts.save()

		for _, plug in pairs(hook.plugins) do
			plug:disable()
		end

		os.exit()
	end,
	---@param instruction Instruction
	["LOG"] = function(instruction)
		if instruction.message == nil then
			return false, "No message provided"
		end
		_jpxs:print(instruction.message)
	end,
}

local useCustomWorker = _jpxs.overrides.useCustomWorker or string.pack ~= nil
local workerPath = _jpxs.overrides.workerPath or "main/jpxs.worker.lua"

-- load worker script into main/jpxsWorker.lua
_jpxs.workerString = _jpxs.overrides.workerString
	or (
		"--"
		.. name
		.. " WORKER SCRIPT\n-- Used to prevent worker errors\n\nrequire 'main.util'\n\n---@param message string\nlocal function handleMessage (message)\n     local method, callbackIndex, scheme, path, numHeaders, pos = ('znssn'):unpack(message)\n\n        local headers = {}\n      for _ = 1, numHeaders do\n              local key, value\n                       key, value, pos = ('ss'):unpack(message, pos)\n          headers[key] = value\n           end\n\n  ---@type HTTPResponse?\n        local res\n     if method == 'POST' then\n       local body, contentType = ('ss'):unpack(message, pos)\n          res = http.postSync(scheme, path, headers, body, contentType)\n   else\n          res = http.getSync(scheme, path, headers)\n       end\n\n local serialized = ('ni1'):pack(callbackIndex, res and 1 or 0)\nif res then\n            serialized = serialized .. ('nsn'):pack(res.status, res.body, table.numElements(res.headers))\n           for key, value in pairs(res.headers) do\n        serialized = serialized .. ('ss'):pack(key, value)\n             end\n   end\n\n          sendMessage(serialized)\nend\n\nwhile true do\n  while true do\n         local message = receiveMessage()\n                if not message then\n                   break\n          end\n\n          handleMessage(message)\n        end\n\n if sleep(100) then\n             break\n  end\nend"
	)

if useCustomWorker then
	local w = io.open(workerPath, "w")
	if not w then
		return
	end
	w:write(_jpxs.workerString)
	w:close()
end

---@param method string
---@param scheme string
---@param path string
---@param headers table<string, string>
---@param body? string
---@param contentType? string
---@param callback fun(response?: HTTPResponse)
local function request(method, scheme, path, headers, body, contentType, callback)
	local index = #requestQueue + 1

	local serialized = ("znssn"):pack(method, index, scheme, path, table.numElements(headers))
	for key, value in pairs(headers) do
		serialized = serialized .. ("ss"):pack(key, value)
	end

	if method == "POST" then
		serialized = serialized .. ("ss"):pack(body, contentType)
	end

	table.insert(requestQueue, { serialized = serialized, callback = callback })

	workerPending = workerPending + 1
	worker:sendMessage(serialized)

	if _jpxs.debug then
		_jpxs:print(string.format("[%s] %s%s", method, scheme, path))
	end
end

---@param message string
local function handleMessage(message)
	local callbackIndex, hasResponse, pos = ("ni1"):unpack(message)

	---@type HTTPResponse?
	local res
	if hasResponse == 1 then
		res = {}
		local status, body, numHeaders
		status, body, numHeaders, pos = ("nsn"):unpack(message, pos)
		res.status = status
		res.body = body

		local headers = {}
		for _ = 1, numHeaders do
			local key, value
			key, value, pos = ("ss"):unpack(message, pos)
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
function _jpxs.get(scheme, path, headers, callback)
	if useCustomWorker then
		request("GET", scheme, path, headers, nil, nil, callback)
	else
		http.get(scheme, path, headers, callback)
	end
end

---Send an HTTP(S) POST request asynchronously.
---@param scheme string The hostname of the server to send the request to, with optional protocol and port. Ex. google.com, https://google.com, https://google.com:443
---@param path string The path to request from the server.
---@param headers table<string, string> The table of request headers.
---@param body string The request body.
---@param contentType string The request body MIME type.
---@param callback fun(response?: HTTPResponse) The function to be called when the response is received or there was an error.
function _jpxs.post(scheme, path, headers, body, contentType, callback)
	if useCustomWorker then
		request("POST", scheme, path, headers, body, contentType, callback)
	else
		http.post(scheme, path, headers, body, contentType, callback)
	end
end

function _jpxs.sendInstructionResponse(instructionId, success, res)
	_jpxs.post(
		webserverconfig.host,
		webserverconfig.instructionPath,
		{},
		json.encode({
			instructionId = instructionId,
			serverId = _jpxs.serverId,
			success = success,
			response = res,
			auth = _jpxs.key,
		}),
		webserverconfig.contentType,
		function(response)
			if response and response.status ~= 200 and _jpxs.debug then
				_jpxs:print("Failed to send response to instruction " .. instructionId)
			end
		end
	)
end

---@param res HTTPResponse
function _jpxs:handleResponse(res)
	if not res then
		return
	end
	if res.status ~= 200 then
		if _jpxs.debug then
			_jpxs:print(string.format("Request failed with status %d", res.status))
			_jpxs:print(res.body)
		end
		return
	end

	local body = json.decode(res.body)
	if body.status == "error" then
		_jpxs:print("Error: " .. body.error)
		return
	end

	if _jpxs.debug then
		_jpxs:print(res.body)
	end

	---@type Instruction[]
	local instructions = body.instructions
	if not instructions then
		return
	end

	for _, instruction in ipairs(instructions) do
		if _jpxs.overrides.blacklistedInstructions and _jpxs.overrides.blacklistedInstructions[instruction.type] then
			return
		end

		instruction.cb = function(success, res)
			if not instruction.hasSent then
				_jpxs.sendInstructionResponse(instruction.id, success, res)
				instruction.hasSent = true
			end
		end

		instruction.hasSent = false

		local success, res = _jpxs.instructionHandlers[instruction.type](instruction)

		if not instruction.hasSent then
			_jpxs.sendInstructionResponse(instruction.id, success, res)
			instruction.hasSent = true
		end
	end
end

--- Get the current mode information
---@return Plugin | nil
function _jpxs:getModeInformation()
	for _, plugin in pairs(hook.plugins) do
		if string.lower(plugin.fileName) == string.lower(hook.persistentMode) then
			return plugin
		end
	end

	return nil
end

function _jpxs:init()
	--- Init

	local modeInfo = _jpxs:getModeInformation()

	local initBody = {
		name = server.name,
		icon = _jpxs.serverInfo.icon,
		description = _jpxs.serverInfo.description,
		link = _jpxs.serverInfo.link,
		port = server.port,
		gameType = server.type,
		version = _jpxs._version,
		mode = {
			enabled = _jpxs.overrides.showMode or true,
			name = nil,
			description = nil,
			author = nil,
		},
		bans = {},
	}

	if modeInfo ~= nil then
		initBody.mode.name = (_jpxs.overrides.showCustomMode or true) and modeInfo.name or nil
		initBody.mode.description = (_jpxs.overrides.showModeDescription or true) and modeInfo.description or nil
		initBody.mode.author = (_jpxs.overrides.showModeAuthor or true) and modeInfo.author or nil
	end

	for _, acc in ipairs(accounts.getAll()) do
		if acc.banTime > 0 then
			table.insert(initBody.bans, { name = acc.name, subRosaId = acc.subRosaID })
		end
	end

	hook.run("PreJPXSInit", initBody)

	initBody.auth = _jpxs.key
	local initString = json.encode(initBody)

	_jpxs.post(
		webserverconfig.host,
		webserverconfig.initPath,
		{},
		initString,
		webserverconfig.contentType,
		function(httpRequestReturn)
			if not _jpxs.enabled then
				return
			end
			if not httpRequestReturn then
				_jpxs:print("Failed to load. Unknown error.")
			end
			if not httpRequestReturn or httpRequestReturn.status ~= 200 then
				_jpxs:print("Failed to load, init failed. Status: " .. httpRequestReturn.status)
				if httpRequestReturn.body then
					_jpxs:print(httpRequestReturn.body)
				end
				return
			end
			local body = json.decode(httpRequestReturn.body)
			_jpxs.serverId = body.serverId

			if body.status == "error" then
				_jpxs:print("Error: " .. body.error)
			end

			if _jpxs.serverId == nil then
				_jpxs:print("Init failed. Could not find server ID")
			else
				if _jpxs._loaderVersion ~= 3 then
					_jpxs:print("Init successful! Server ID: " .. _jpxs.serverId)
				end

				hook.run("PostJPXS Init", body)
			end

			if body.bans then
				_jpxs.banlist = body.bans
			end

			_jpxs:handleResponse(httpRequestReturn)
		end
	)
end

function _jpxs.handleIncomingPlayers()
	for index, _ in pairs(awaitingPlayers) do
		local ply = players[index]

		if ply.isBot or ply.connection == nil then
			awaitingPlayers[index] = nil
			return
		end

		hook.run("PreJPXSBuildBody", ply)

		local body = {
			serverId = _jpxs.serverId,
			name = ply.account.name,
			phoneNumber = ply.account.phoneNumber,
			steamId = ply.account.steamID,
			gameId = ply.account.subRosaID,
			hashedIp = ply.connection.address,
			gender = ply.gender,
			head = ply.head,
			skinColor = ply.skinColor,
			hair = ply.hair,
			hairColor = ply.hairColor,
			eyeColor = ply.eyeColor,
		}

		hook.run("PreJPXSJoin", ply, body)

		body.auth = _jpxs.key

		ply.data.jpxsDataReady = false

		local postString = json.encode(body)

		_jpxs.post(
			webserverconfig.host,
			webserverconfig.joinPath,
			{},
			postString,
			webserverconfig.contentType,
			function(res)
				if not res or res.status ~= 200 then
					return
				end

				local body = json.decode(res.body)

				ply.data.isVpn = body.isVpn
				ply.data.country = body.country
				ply.data.countryCode = body.countryCode
				ply.data.timeZone = body.timeZone

				ply.data.nameHistory = body.nameHistory
				ply.data.alts = body.alts

				ply.data.jpxsDataReady = true

				hook.run(name .. "DataReady", ply)

				_jpxs:handleResponse(res)
			end
		)

		awaitingPlayers[index] = nil
	end
end

--- Send a ping to the JPXS server.
function _jpxs:ping()
	if not _jpxs.enabled then
		return
	end
	if not _jpxs.serverId then
		return
	end

	local body = {
		players = {},
		uptime = math.floor(os.clock() - startTime),
		serverId = _jpxs.serverId,
		tps = _jpxs.tpsInfo.recent,
		map = currentMap,
	}

	for _, ply in pairs(players.getNonBots()) do
		if not ply.account then
			return
		end
		table.insert(body.players, {
			subRosaId = ply.account.subRosaID,
			team = ply.team,
			corp = ply.corporateRating,
			money = ply.money,
		})
	end

	hook.run("PreJPXSPing", body)

	body.auth = _jpxs.key

	local postString = json.encode(body)
	_jpxs.post(
		webserverconfig.host,
		webserverconfig.pingPath,
		{},
		postString,
		webserverconfig.contentType,
		function(response)
			_jpxs:handleResponse(response)
			hook.run("PostJPXSPing", body)
		end
	)
end

---@param info serverInfo
function _jpxs:setInfo(info)
	_jpxs.serverInfo = info
end

function _jpxs:calcTPS(avg, exp, tps)
	return (avg * exp) + (tps * (1 - exp))
end

---upload a string to gartbin
---@param str string
---@param cb fun(success: boolean, id: string)
function _jpxs:gartbin(str, cb)
	_jpxs.post(
		"https://bin.gart.sh",
		"/api/paste",
		{},
		json.encode({
			content = str,
		}),
		"application/json",
		function(res)
			if res and res.status == 200 then
				local pRes = json.decode(res.body)
				if pRes.error or not pRes.id then
					cb(false, pRes.error)
				else
					cb(true, pRes.id)
				end
			end
		end
	)
end

function _jpxs:logEvent(event, admin)
	if not _jpxs.enabled or not _jpxs.serverId then
		return
	end

	local body = {
		serverId = _jpxs.serverId,
		event = event,
		admin = admin or false,
	}

	body.auth = _jpxs.key

	local postString = json.encode(body)
	_jpxs.post(
		webserverconfig.host,
		webserverconfig.logPath,
		{},
		postString,
		webserverconfig.contentType,
		function(response)
			_jpxs:handleResponse(response)
		end
	)
end

hook.add("Logic", _jpxs.plugin.name, function()
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

	if not _jpxs.enabled then
		return
	end
	elapsed = elapsed + (1 / server.TPS)

	if elapsed >= webserverconfig.pingInterval then
		elapsed = 0
		_jpxs:ping()
	end

	--- player management
	_jpxs:handleIncomingPlayers()

	--- tps tracking
	_jpxs.tpsInfo.sampleCounter = _jpxs.tpsInfo.sampleCounter + 1
	if _jpxs.tpsInfo.sampleCounter == _jpxs.tpsInfo.sampleInterval then
		_jpxs.tpsInfo.sampleCounter = 0

		local now = os.realClock()
		local tps = 1 / (now - _jpxs.tpsInfo.lastSampleTime) * _jpxs.tpsInfo.sampleInterval

		_jpxs.tpsInfo.recent =
			_jpxs:calcTPS(_jpxs.tpsInfo.recent, 1 / math.exp((16 * _jpxs.tpsInfo.sampleInterval) / 5000), tps)

		_jpxs.tpsInfo.lastSampleTime = now
	end
end)

hook.add("PostPlayerCreate", _jpxs.plugin.name, function(ply)
	if not _jpxs.enabled then
		return
	end
	awaitingPlayers[ply.index] = true
end)

hook.add("ServerSend", _jpxs.plugin.name, function()
	currentMap = server.levelToLoad
end)

hook.add("LogEvent", _jpxs.plugin.name, function(event)
	_jpxs:logEvent(event)
end)

hook.add("AdminLogEvent", _jpxs.plugin.name, function(event)
	_jpxs:logEvent(event, true)
end)

hook.add("PlayerChat", _jpxs.plugin.name, function(ply, message)
	if not _jpxs.enabled or not string.match(message, "^verify") then
		return
	end

	-- code is in the format of "verify xxx xxx" or "verify xxxxxx"
	local code = string.match(message, "verify%s+(%w+)") or string.match(message, "verify(%w+)")

	local body = {
		serverId = _jpxs.serverId,
		phoneNumber = ply.account.phoneNumber,
		auth = _jpxs.key,
		code = code,
	}

	local postString = json.encode(body)

	_jpxs.post(
		webserverconfig.host,
		webserverconfig.verifyPath,
		{},
		postString,
		webserverconfig.contentType,
		function(response)
			_jpxs:handleResponse(response)

			if response and response.status == 200 then
				local body = json.decode(response.body)
				if body.state == "error" then
					ply:sendMessage("Error: " .. body.error)
				else
					ply:sendMessage(body.message)
				end
			end
		end
	)

	return hook.override
end)

-- start needed threads
worker = Worker.new(workerPath)

-- Start everything
_jpxs:init()

-- Commands

_jpxs.plugin.commands["/namehist"] = {
	info = "Check the previous names of a given user",
	usage = "name",
	canCall = function(ply)
		return ply.isAdmin or ply.isConsole
	end,
	call = function(ply, _, args)
		assert(#args >= 1, "usage")
		local option = string.lower(args[1])
		local target = findOnePlayer(option)
		assert(target, "Invalid player")
		if target and target.data.nameHistory ~= nil then
			ply:sendMessage(string.format("%s's name history:", target.name))
			for i = 1, #target.data.nameHistory do
				ply:sendMessage(string.format("Name %s : %s", i, target.data.nameHistory[i]))
			end
		end
	end,
}

_jpxs.plugin.commands["/isvpn"] = {
	info = "Check if a given user is using a VPN",
	usage = "name",
	canCall = function(ply)
		return ply.isAdmin or ply.isConsole
	end,
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
			ply:sendMessage(
				string.format(
					"%s %s using a VPN | Country: %s",
					target.name,
					target.data.isVpn and "is" or "is not",
					target.data.country
				)
			)
		end
	end,
}

_G.jpxs = _jpxs
