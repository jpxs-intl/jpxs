---@type jpxs
local jpxs = ...
--[[
hook.add('SendPacket', jpxs.plugin.name, function(x, _, z)
    if z == 1 and table.contains(jpxs.banlist, x) then
        memory.writeBytes(memory.getBaseAddress() + 0x39075C84, ("\0"):rep(8))
    end
end)
]]

--This checks if the IP is the JPXS Server list pinger and allows it to collect the data required.
local JPXSPingIP = {
	["107.136.76.82"] = true,--GoodMorningKat
	["184.155.183.147"] = true,--Cybersoul21	
	["104.33.157.67"] = true --Sammy
}

hook.add('SendPacket', jpxs.plugin.name, function(ip, port, pType)
	if pType == 1 and JPXSPingIP[ip] then
		memory.writeBytes(memory.getBaseAddress() + 0x39075C84, ('UploadKey'):rep(5))
	end
end)
