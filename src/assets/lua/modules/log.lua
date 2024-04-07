---@type Core
local Core = ...

Core:getDependencies({ "client" }, function()
	---@type JPXSClient
	local Client = Core:GetModule("client")

	hook.add("LogEvent", "jpxs.log", function(event)
		Client.sendMessage("data", "server:log", {
			message = event,
		})
	end)

	hook.add("AdminLogEvent", "jpxs.log", function(event)
		Client.sendMessage("data", "server:log", {
			message = event,
			admin = true,
		})
	end)
end)
