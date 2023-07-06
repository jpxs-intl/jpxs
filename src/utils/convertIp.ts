export default class LocalIpConverter {
  public static convertIp(ip: string): string {
    if (ip.startsWith("172.18")) {
      return "5.161.203.188";
    }

    return ip;
  }
}
