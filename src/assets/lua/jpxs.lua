local plugin = ...
plugin.name = 'jpxs'
plugin.author = 'gart, Jpsh, FieriFerret, noche, jdb'
plugin.description = 'Manages all things JPXS'


---@class serverInfo Stores JPXS server info
local serverInfo = {
    description = 'The generic server ever',
    link = 'https://jpxs.io',
    icon = 'https://jpxs.io/assets/img/logo.png'
}

---@class jpxs
local jpxs = {
    _loaderversion = 1,
    _version = 0,
    enabled = false,
    key = nil,
    plugin = plugin,
    serverId = nil,
    serverInfo = serverInfo,
    overrides = {},
}

---@param text string print logs
function jpxs:print(text)
    print('\27[30;1m[' .. os.date('%X') .. ']\27[0m \27[38;5;202m[JPXS]\27[0m ' .. text)
end

---@param file string The path to the JPXS key file.
function jpxs:auth(file)
    local f = io.open(file, 'r')
    if f then
        jpxs.key = f:read('*all')
        f:close()
        jpxs.enabled = true
    else
        jpxs:print('No JPXS key found. Please contact gart to get one.')
        jpxs:print('Join the discord at https://jpxs.io')
    end
end

function jpxs:load()
    jpxs:auth(jpxs.overrides.keyPath or '.jpxs.key')
    if jpxs.enabled then
        http.get("https://jpxs.international", "/api/plugin/" + jpxs.key, {}, function(res)
            if (res.status == 200) then
                local str = res.body
                loadstring(str)(jpxs)
            else
                jpxs:print('JPXS key is invalid. Please contact gart to get a new one.')
                jpxs:print('Join the discord at https://jpxs.io')
            end
        end)
    end
end

jpxs:load()
