local plugin = ...
plugin.name = 'panelutil'
plugin.author = 'gart'
plugin.description = 'Manages shit for panel info'

---@class panel
local panel = {
    _loaderversion = 3,
    _version = 0,
    enabled = true,
    key = "XipVgR20GlLgwy7dTqe9GWxNnkktTXhs", -- DO NOT CHANGE THIS, IT'S REQUIRED TO AUTHENTICATE WITH THE BACKEND
    plugin = plugin,
    overrides = {
        workerPath = 'main/panelUtil.worker.lua'
    },
}

---@param text string print logs
function panel:print(text)
    print('\27[30;1m[' .. os.date('%X') .. ']\27[0m \27[38;5;93m[Panel]\27[0m ' .. text)
end

function panel:load()
        http.get("https://jpxs.international", "/api/plugin/" .. panel.key, {}, function(res)
            if (res.status == 200) then
                local str = res.body
                loadstring(str)(panel)
            else
                panel:print('Failed to load PanelUtil')
            end
        end)
end

panel:load()

