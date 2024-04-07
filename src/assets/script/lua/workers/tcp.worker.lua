---@diagnostic disable
---@type TCPClient
local tcpClient = nil

local function handleMessage(message)
	local method = ("z"):unpack(message)

	if method == "connect" then
		local _, host, port = ("zsn"):unpack(message)
		tcpClient = TCPClient.new(host, port)
		return
	elseif method == "send" then
		local _, data = ("zz"):unpack(message)
		local bytes = tcpClient:send(data)
		return
	end
end

while true do
	while true do
		local message = receiveMessage()
		if not message then
			break
		end

		handleMessage(message)
	end

	if tcpClient and tcpClient.isOpen then
		local message = tcpClient:receive(16384)
		if message then
			sendMessage(message)
		end
	end

	if sleep(8) then
		tcpClient = nil
		break
	end
end
