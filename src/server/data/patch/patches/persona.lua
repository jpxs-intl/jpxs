local jpxs = ...

local hideAnons = true

--Original phoneNumber is key, 1 is newName, 2 is newPhone, 3 is head 4 is eyes 5 is hair 6 is hair color 7 is skin 8 is gender
local anonAppearance = {
	-- [6443302] = { "Ace of Blades", 3192436, 1, 3, 3, 4, 1, 1, 20137, "76561198035620633" },
}

---@diagnostic disable-next-line: lowercase-global
disabledPersonas = {}

local isInsideServerReceive
local shouldIgnoreMessage

hook.add("ServerReceive", "persona", function()
	isInsideServerReceive = true
end)

local joinMessageQueue = {}

hook.add("PostPlayerCreate", "persona", function(ply)
	joinMessageQueue[ply.index] = true
end)

hook.add("PostPlayerDelete", "persona", function(ply)
	joinMessageQueue[ply.index] = nil
end)

hook.add("Physics", "persona", function()
	for index, _ in pairs(joinMessageQueue) do
		local ply = players[index]
		if ply.isBot then
			joinMessageQueue[index] = nil
		else
			if
				hideAnons
				and ply.connection
				and ply.phoneNumber
				and ply.phoneNumber > 0
				and anonAppearance[ply.phoneNumber]
				and not disabledPersonas[ply.phoneNumber]
			then
				local tab = anonAppearance[ply.phoneNumber]
				ply.name = tab[1]
				ply.phoneNumber = tab[2]
				ply.head = tab[3]
				ply.eyeColor = tab[4]
				ply.hair = tab[5]
				ply.hairColor = tab[6]
				ply.skinColor = tab[7]
				ply.gender = tab[8]
				ply.subRosaID = tab[9]
				ply:update()
				ply:updateFinance()
				if ply.human then
					ply.human.head = tab[3]
					ply.human.eyeColor = tab[4]
					ply.human.hair = tab[5]
					ply.human.hairColor = tab[6]
					ply.human.skinColor = tab[7]
					ply.human.gender = tab[8]
					ply.human.lastUpdatedWantedGroup = -1
				end
			end
			joinMessageQueue[index] = nil
		end
	end
end)

hook.add("PostServerReceive", "persona", function()
	isInsideServerReceive = nil
	shouldIgnoreMessage = nil
end)

hook.add("PostEventUpdatePlayer", "persona", function(ply)
	if isInsideServerReceive and anonAppearance[ply.account.phoneNumber] then
		shouldIgnoreMessage = true
	end
end)

hook.add("EventMessage", "persona", function(_, message)
	if shouldIgnoreMessage then
		shouldIgnoreMessage = nil
		local a = string.match(message, "Joined")
		if a then
			local newName = (anonAppearance[findOneAccount(message:match("%S+")).phoneNumber][1] or nil)
			if newName then
				chat.announce(newName .. " Joined")
			end
			return hook.override
		end
	end
end)

hook.add("PreJPXSJoin", "persona", function(ply, body)
	local tab = anonAppearance[ply.account.phoneNumber]
	if tab then
		body.name = tab[1]
		body.phoneNumber = tab[2]
		body.head = tab[3]
		body.eyeColor = tab[4]
		body.hair = tab[5]
		body.hairColor = tab[6]
		body.skinColor = tab[7]
		body.gender = tab[8]
		body.gameId = tab[9]
		body.steamId = tonumber(tab[10])
	end
end)
