---@type jpxs
local jpxs = ...

local config = {
    banTime = 99999999,
    banMin = 10080,
    banMessage = "You are not allowed to play on this server. (ERR_DISALLOWED)"
}

local banList = {
    2567400, -- GryphonPhoenix -- Doxing Repeatedly - Using alts to dox - Never changing horrible behaviour.
    2653611, -- GryphonPhoenix alt account.
    5312891, -- GryphonPhoenix alt account.
    2566407, -- Wasabii -- Repeated sexual comments about minors - assisting Billy Herrington with ban evasion repeatedly.
    3199168, -- Billy Herrington -- Attempting to groom minors -Repeated sexual comments towards minors - heavy alt abuse to ban evade.
    2656434, -- Billy Herrington alt account.
    2650782, -- Billy Herrington alt account.
    2655926, -- Billy Herrington alt account. -- Likely shared alt account with Wasabii
    2651896, -- Billy Herrington alt account.
    2657434, -- Billy Herrington alt account. -- Likely shared alt account with Wasabii
    2658181, -- Billy Herrington alt account. -- Likely shared alt account
    3199015, -- noodle cat -- Repeated overtly sexual comments towards a child.
    5311753, -- JKanStyle -- Repeated suggestive comments - inappropriate behavior - emotional manipulation towards a minor
    2569064, -- JKanStyle alt account.
    2657167, -- JKanStyle alt account.
    2651555, -- JKanStyle alt account.
    5315438, -- JKanStyle alt account.
    5310945, -- Crazed -- Doxing - Immense racism - Never changing horrible behaviour.
    6449956, -- Crazed alt account.
    2560063, -- Lenny -- Immense amount of pedophilic content found in internet history.
    6446615, -- Lenny alt account.
    3194413, -- commander -- Doxing - Attempting to get another member of the community to commit suicide - Never changing horrible behaviour.
    2563559, -- Insane Hell Gamer -- Doxing - Cheating - Attempting to get another member of the community to commit suicide - Never changing horrible behaviour.
    2657925, -- Insane Hell Gamer (alt)
    2654917, -- Insane Hell Gamer (alt)
    2659117, -- Insane Hell Gamer (alt)
    3191989, -- Xena -- Attempting to groom minors - Doxing IPs from a self-hosted minecraft server
    2562262, -- Gamingattaic -- DDoSing servers leading to Dingus quitting - Cheating - 1 of 2 possible D44://Diver World/ DDoSers - cheating
    2651279, -- honeyswagchild -- DDoSing servers leading to Dingus quitting - Cheating - 1 of 2 possible D44://Diver World/ DDoSers - cheating
    3199570, -- Detroit Baby. -- Cheating 
    2652219, -- Timmy -- Cheating - Having a public logs channel for his server "Cat Game" where IPs are visible. 
    6394365, -- KFC Man -- Cheating - Spamming videos of baby animals being killed and pornographic content in "generic subrosa server discord"
    2655961, -- KFC MAN alt account.
    6395009, -- MCShwa -- Cheating - Spamming videos of baby animals being killed and pornographic content in "generic subrosa server discord"
    3197951, -- RoyalPillows -- Following someone around asking how their dead father is - Harrassment using derogatory racist, homophobic and transphobic slurs.
    3195107, -- jay gnome -- A NDM Member who partook in multiple raids - Posting incredible ammounts of transphobic content - Posting incredible ammounts of homophobic content
    3190658, -- skript -- A NDM Member who partook in multiple raids - Using alts for character assassination [Trying to get the community to believe gart is a pedo] - 
    6397087, -- skript alt account. -- Shared by multiple members of NDM
    2659949, -- Octogone -- Doxxing gakmaster
    2566558, -- GVNT, racist loser fulltime fucking pain in the ass
    2654154, -- GVNT alt
    5310835, -- 1Squilliam1 -- Doxxing on multiple occasions, Spreading information claiming Jpsh & D44Diver are heavily associated with pedophiles and or are pedophiles.
    2651345, -- Cshark -- Asked by fieri to add to list
--  3190207, -- Dr.Cumlazer -- Doxxing D44Diver.
    2652014, -- Stunna -- Alt account
    2561190, -- Stunna --  Admitted to wanting to shoot up a mall to kill minorities over telegram
    2564224, -- Cybersoul21 -- Doxxing Informal Vagabonds snapchat. Directly admitted to it.
    6444355, -- Good Morning Kat -- Doxxing Informal Vagabonds face. 

}

hook.add('AccountTicketFound', 'banlist', function(acc)
    if not acc then return end
    local freak = table.contains(banList, acc.phoneNumber)
    if freak and acc.banTime == nil or freak and acc.banTime < config.banMin then
        acc.banTime = config.banTime
        hook.once('SendConnectResponse', function(_, _, data)
            data.message = config.banMessage
        end)
        return hook.override
    end
end)
