---@type Core
local Core = ...

--- Get the current mode information
---@return Plugin | nil
local function getModeInformation()
	for _, plugin in pairs(hook.plugins) do
		if string.lower(plugin.fileName) == string.lower(hook.persistentMode) then
			return plugin
		end
	end

	return nil
end

Core:getDependencies({ "client" }, function()
	---@type JPXSClient
	local Client = Core:GetModule("client")

	local mode = getModeInformation()
	---@type {name: string, subRosaId: string}[]
	local bans = {}

	for _, acc in ipairs(accounts.getAll()) do
		if acc.banTime > 0 then
			table.insert(bans, { name = acc.name, subRosaId = acc.subRosaID })
		end
	end

	Client.sendMessage("data", "server:init", {
		name = server.name,
		port = server.port,
		type = server.type,
		mode = mode and {
			name = mode.name,
			author = mode.author,
			description = mode.description,
		} or nil,
		bans = bans,
	})
end)
