# JPXS Overrides
Use these optons to override the default behavior of JPXS.

## Enable/Disable features

    showMode: true # Show the mode name
    showCustomMode: true # Show the custom mode name instead of server.mode
    showModeDescription: true # Show the mode description 
    showModeAuthor: true # Show the mode author
    
    useCustomWorker: true # Use the JPXS http worker instead of the default one

## Edit Features

    customWorkerPath: 'main/jpxs.worker.lua' # Path to save the custom worker
    workerString: '...' # Custom worker lua string

    host: 'https://jpxs.international' # JPXS host

    pingPath: '/api/data/ping' # JPXS ping request path
    initPath: '/api/data/init' # JPXS init request path
    joinPath: '/api/data/join' # JPXS join request path    

    pingInterval: 15 # Ping interval in seconds
    maximumWaitTime: 120 # Maximum wait time beteen pings in seconds

    contentType: 'application/json' # Content type for requests

    banMessage: 'You are banned from this server for %s seconds.' # Ban message
    permBanMessage: 'You are permanently banned from this server.' # Permanent ban message