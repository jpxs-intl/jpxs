---@class Core
local Core = {}
Core.debugEnabled = false

Core.KEEP_OUT_MESSAGE = [[
	-- ##############################################################
	-- This file is part of JPXS                                     
	--                                                               
	-- if you're seeing this, and you're looking to tinker with it,  
	-- please don't, it's literally months of work here and          
	-- I don't want it fucking with something on the server          
	-- thanks, gart                                                  
	-- ##############################################################
]]

Core.config = {
	updateInterval = 60 * 15,
}

---@type Plugin
Core.plugin = ...

---@type {[string]: any}
Core.moduleCache = {}

---@type JPXSClient
Core.client = nil

Core.assetHost = {
	host = "https://assets.jpxs.io",
	path = "/plugins/jpxs/",
}

Core.storagePath = ".jpxs/"

local modules = {
	"init",
	"players",
	"instructions",
	"log",
	"performance",
	"typeLoader",
	"readme",
}

---@param text string print logs
function Core:print(text)
	print("\27[30;1m[" .. os.date("%X") .. "]\27[0m \27[38;5;202m[JPXS]\27[0m " .. text)
end

---@param text string print logs
function Core:debug(text)
	if Core.debugEnabled then
		Core:print(text)
	end
end

---@param id string
---@param cb fun(name: string, module: any)?
function Core:downloadModule(id, cb)
	http.get(Core.assetHost.host, Core.assetHost.path .. "modules/" .. id .. ".lua", {}, function(response)
		if response and response.status == 200 then
			local file = "--" .. id .. ".lua\n\n" .. Core.KEEP_OUT_MESSAGE .. "\n\n" .. response.body
			Core.moduleCache[id] = loadstring(file)(Core)
			Core:debug(string.format("Downloaded module %s", id))

			if cb then
				cb(id, Core.moduleCache[id])
			end
		else
			Core:debug(
				string.format("Failed to download module %s (%s)", id, response and response.status or "no response")
			)
		end
	end)
end

---@param id string
---@param cb fun(name: string, module: any)?
function Core:getOrDownloadModule(id, cb)
	if Core.moduleCache[id] then
		if cb then
			cb(id, Core.moduleCache[id])
		end
	else
		Core:downloadModule(id, cb)
	end
end

---@param id string
---@return any
function Core:GetModule(id)
	return Core.moduleCache[id]
end

---@param modules string[]
---@param cb fun()?
function Core:getDependencies(modules, cb)
	local neededToLoad = {}
	for _, name in ipairs(modules) do
		table.insert(neededToLoad, name)
	end

	local function onLoad(name)
		table.remove(neededToLoad, table.find(neededToLoad, name))
		if #neededToLoad == 0 then
			if cb then
				cb()
			end
		end
	end

	for _, name in pairs(neededToLoad) do
		Core:getOrDownloadModule(name, onLoad)
	end
end

function Core:load()
	Core:getOrDownloadModule("client", function(_, Client)
		Client.connect()
		Client.onConnect = function()
			Core:debug("Connected to JPXS")
			Core:getDependencies(modules)
		end
	end)
end

Core:load()

_G.JPXS = Core

return Core
