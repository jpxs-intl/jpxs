---@type Core
local Core = ...

http.get(Core.assetHost.host, Core.assetHost.path .. "types.lua", {}, function(response)
	if response and response.status == 200 then
		local content = "--jpxs.types.lua\n\n" .. Core.KEEP_OUT_MESSAGE .. "\n\n" .. response.body
		local path = Core.storagePath .. ".meta/"
		os.createDirectory(path)
		local file = io.open(path .. "jpxs.lua", "w")
		if not file then
			Core:debug("Failed to write types")
			return
		end

		file:write(content)
	else
		Core:debug(string.format("Failed to download types (%s)", response and response.status or "no response"))
	end
end)
