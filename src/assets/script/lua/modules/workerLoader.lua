---@type Core
local Core = ...

local path = Core.storagePath
os.createDirectory(path)

local workers = {
	"tcp",
}

---@class WorkerLoader
local WorkerLoader = {}

---@param worker string
function WorkerLoader.load(worker)
	local workerPath = path .. worker .. ".worker.lua"
	http.get(Core.assetHost.host, Core.assetHost.path .. "workers/" .. worker .. ".worker.lua", {}, function(res)
		if res and res.status == 200 then
			local file = io.open(workerPath, "w")
			if not file then
				Core:debug("Failed to write worker " .. worker)
				return
			end
			file:write("--" .. worker .. ".worker.lua\n\n" .. Core.KEEP_OUT_MESSAGE .. "\n\n" .. res.body)
			file:close()

			Core:debug("Downloaded worker " .. worker)
		else
			Core:debug("Failed to download worker " .. worker .. " (" .. (res and res.status or "no response") .. ")")
		end
	end)
end

function WorkerLoader.loadWorkers()
	WorkerLoader.loadGitIgnore()
	for _, worker in pairs(workers) do
		WorkerLoader.load(worker)
	end
end

function WorkerLoader.loadGitIgnore()
	local file = io.open("data/.gitignore", "a")
	if not file then
		Core:debug("Failed to write .gitignore")
		return
	end

	file:write("jpxs/\n")
	file:close()
end

return WorkerLoader
