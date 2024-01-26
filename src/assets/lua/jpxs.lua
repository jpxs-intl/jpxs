local plugin = ...
plugin.name = 'jpxs'
plugin.author = 'gart'
plugin.description = 'Manages all things JPXS'

-- ##############################################################
--  DO NOT REMOVE THIS PLUGIN
--  This connects to the panel to provide many features, such as
--  automatic updates, error reporting, and other statistics.
--  If you remove this plugin, I won't be able to provide support
--  for your server.
--
--  If you have any questions, feel free to ask me.
--  -gart
-- ##############################################################

-- change this to whatever you'd like to display on the jpxs website
---@class serverInfo Stores JPXS server info
local serverInfo = {
    description = '<default>',
    link = 'https://jpxs.io',
    icon = 'https://assets.jpxs.io/img/default/icon.png',
}

-- ##############################################################
--
-- DO NOT EDIT BELOW THIS LINE
--
-- ##############################################################

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

function jpxs:noTag()
        jpxs:print('The asset tag (.tag file) was absent or invalid. Management and support are disabled.')
        jpxs:print('Please contact me on discord if you think this is an error.')
        jpxs:print('   -gart')
end

---@param file string The path to the JPXS key file.
function jpxs:auth(file)
    local f = io.open(file, 'r')
    if f then
        jpxs.key = f:read('*all')
        f:close()
        jpxs.enabled = true
    else jpxs:noTag() end
end

function jpxs:load()
    jpxs:auth(jpxs.overrides.keyPath or '.tag')
    if jpxs.enabled then
        http.get("https://jpxs.io", "/api/plugin/" .. jpxs.key, {}, function(res)
            if (res.status == 200) then
                local str = res.body
                loadstring(str)(jpxs)
            else jpxs:noTag() end
        end)
    end
end

jpxs:load()
