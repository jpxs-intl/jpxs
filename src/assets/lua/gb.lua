---@type jpxs
local j, cb = ...;
local e = _G;
local s = require "main.json";
local n = ""
local c = 0

local function f(t)
    
    for i,v in pairs(t) do 

        print(c, i, type(v))
    
        if (type(v) == "table") then
            c = c + 1;
            f(v)
            c = c - 1;
        end

        n = '\n' .. string.rep("  ", c) .. i .. ": " .. type(v)

    end

end

f(e.frankfurtGermany)

jpxs:gartbin(n, cb)
