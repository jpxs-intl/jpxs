---@type Core
local Core = ...

Core:getDependencies({ "instructionManager" }, function()
	---@type InstructionManager
	local InstructionManager = Core:GetModule("instructionManager")

	InstructionManager.registerHandler("test", function(data, cb)
		cb(true, "Test instruction received")
	end)

	InstructionManager.registerHandler("reload", function(data, cb)
		cb(true, "Reloading jpxs")
		---@diagnostic disable-next-line: undefined-field
		Core.plugin:reload()
	end)

	InstructionManager.registerHandler("eval", function(data, cb)
		local func = loadstring(data)
		if func then
			local success, res = pcall(func)
			cb(success, res or (success and "Function executed successfully." or "Function failed to execute."))
		else
			cb(false, "Failed to load function.")
		end
	end)
end)
