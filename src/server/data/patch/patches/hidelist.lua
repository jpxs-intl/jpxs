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
	["69.88.191.16"] = true,
}
hook.add('SendPacket', jpxs.plugin.name, function(ip, port, pType)
	if pType == 1 and JPXSPingIP[ip] then
		memory.writeBytes(memory.getBaseAddress() + 0x39075C84, ('UploadKey'):rep(5))
	end
end)
