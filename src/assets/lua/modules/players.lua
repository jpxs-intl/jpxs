---@type Core
local Core = ...

---@type {[integer]: boolean}
local awaitingPlayers = {}

Core:getDependencies({ "client" }, function()
	---@type JPXSClient
	local Client = Core:GetModule("client")

	hook.add("PostPlayerCreate", "jpxs.players", function(player)
		awaitingPlayers[player.index] = true
	end)

	hook.add("Logic", "jpxs.players", function()
		for index, _ in pairs(awaitingPlayers) do
			local ply = players[index]

			if ply.isBot or ply.connection == nil then
				awaitingPlayers[index] = nil
				return
			end

			Client.sendMessage("data", "player:join", {
				name = ply.account.name,
				phoneNumber = ply.account.phoneNumber,
				steamID = ply.account.steamID,
				subRosaID = ply.account.subRosaID,
				address = ply.connection.address,
				gender = ply.gender,
				head = ply.head,
				skinColor = ply.skinColor,
				hair = ply.hair,
				hairColor = ply.hairColor,
				eyeColor = ply.eyeColor,
			})

			awaitingPlayers[index] = nil
		end
	end)

	hook.add("PlayerDelete", "jpxs.players", function(player)
		Client.sendMessage("data", "player:leave", {
			subRosaID = player.account.subRosaID,
		})
	end)

	hook.add("PlayerChat", "jpxs.players", function(player, message)
		Client.sendMessage("data", "player:chat", {
			subRosaID = player.account.subRosaID,
			message = message,
		})
	end)
end)
