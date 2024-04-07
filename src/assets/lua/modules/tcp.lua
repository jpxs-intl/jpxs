---@type Core
local Core = ...

---@diagnostic disable: deprecated
---@class TCP
---@field host string
---@field port integer
---@field thread Worker
---@field messageHandler fun(message: string)
local TCP = {}

---@type TCP[]
local clients = {}

TCP.workerPath = Core.storagePath .. "tcp.worker.lua"
TCP.__index = TCP

---@param host string
---@param port integer
function TCP.connect(host, port)
	local self = setmetatable({
		host = host,
		port = port,
		thread = Worker.new(TCP.workerPath),
	}, TCP)

	self.thread:sendMessage(("zsn"):pack("connect", host, port))

	table.insert(clients, self)

	return self
end

---@param message string
function TCP:sendMessage(message)
	self.thread:sendMessage(("zz"):pack("send", message))
end

---@param cb fun(message: string)
function TCP:onMessage(cb)
	self.messageHandler = cb
end

hook.add("Logic", "jpxs.tcp", function()
	for _, client in pairs(clients) do
		while true do
			local message = client.thread:receiveMessage()
			if not message then
				break
			end

			if client.messageHandler then
				client.messageHandler(message)
			end
		end
	end
end)

return TCP
