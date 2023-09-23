import DataStorage from "./dataStorage";

export default class Metrics {
  public static async getMetrics() {
    let metricsLines: string[] = [];

    metricsLines.push("# HELP total_players_online The total number of players online on all servers");
    metricsLines.push("# TYPE total_players_online gauge");
    metricsLines.push(
      `total_players_online ${await DataStorage.servers.reduce((prev, curr) => prev + curr.players, 0)}`
    );

    metricsLines.push("# HELP total_servers The total number of servers online");
    metricsLines.push("# TYPE total_servers gauge");
    metricsLines.push(`total_servers ${DataStorage.servers.length}`);

    const serversWithPlayers = DataStorage.servers.filter((server) => server.players > 0);

    const versionCounts: { [key: string]: number } = {};
    serversWithPlayers.forEach((server) => {
      if (versionCounts[server.version]) {
        versionCounts[server.version] += server.players;
      } else {
        versionCounts[server.version] = server.players;
      }
    });

    metricsLines.push(
      `# HELP players_online_by_version The number of players online on servers with the given version`
    );
    metricsLines.push(`# TYPE players_online_by_version gauge`);
    Object.keys(versionCounts).forEach((version) => {
      metricsLines.push(`players_online_by_version{version="${version}"} ${versionCounts[version]}`);
    });

    const serverVersionCounts: { [key: string]: number } = {};
    DataStorage.servers.forEach((server) => {
      if (serverVersionCounts[server.version]) {
        serverVersionCounts[server.version] += 1;
      } else {
        serverVersionCounts[server.version] = 1;
      }
    });

    metricsLines.push(`# HELP servers_by_version The number of servers with the given version`);
    metricsLines.push(`# TYPE servers_by_version gauge`);
    Object.keys(serverVersionCounts).forEach((version) => {
      metricsLines.push(`servers_by_version{version="${version}"} ${serverVersionCounts[version]}`);
    });

   
    metricsLines.push(`# HELP players_online_by_server The number of players online on servers with the given name`);
    metricsLines.push(`# TYPE players_online_by_server gauge`);
    DataStorage.servers.forEach((server) => {
        metricsLines.push(`players_online_by_server{name="${server.name}"} ${server.players}`);
    });

    metricsLines.push(`# HELP latency_by_server The latency of servers with the given name`);
    metricsLines.push(`# TYPE latency_by_server gauge`);
    DataStorage.servers.forEach((server) => {
        metricsLines.push(`latency_by_server{name="${server.name}"} ${server.latency}`);
    });

    metricsLines.push(`# HELP tps_by_server The tps of servers with the given name`);
    metricsLines.push(`# TYPE tps_by_server gauge`);
    DataStorage.servers.forEach((server) => {
        metricsLines.push(`tps_by_server{name="${server.name}"} ${DataStorage.serverData[server.id].tps}`);
    });

    return metricsLines.join("\n");
  }
}
