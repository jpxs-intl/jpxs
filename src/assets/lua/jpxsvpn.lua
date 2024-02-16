local plugin = ...
plugin.name = "jpxs-noVPN"
plugin.author = "gart"
plugin.description = "Disallows access to the server for players on a VPN. Requires jpxs.lua and a valid key."

plugin:addHook('JPXSDataReady', function (ply) 

    ---@class VPNData
    ---@field isVpn boolean
    ---@field country string
    ---@field countyCode string
    ---@field timeZone string
    ---@field nameHistory string[]
    ---@field alts {name: string, phone: number}[]
    local vpnData = ply.data

    if vpnData.isVpn then
        ply.connection.timeoutTIme = 60
        plugin:print(string.format("%s (%s) was kicked for using a VPN.", ply.name, ply.phoneNumber))
    end
    
end) 
