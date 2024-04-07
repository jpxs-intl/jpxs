export default interface BaseServerImpl {
    /**
     * Start the server
     */
    start(): void;
    /**
     * Stop the server
     */
    stop(): void;
    /**
     * Get the status of the server
     */
    status(): "listening" | "closed";
}