const os = require("os")
const disk = require("diskusage")
const osu = require("node-os-utils");
const { formatBytes } = require("./utils");

async function getDiskStats(path = "/") {
  try {
    const { available, free, total } = await disk.check(path)
    const used = total - free
    const usedPercent = ((used / total) * 100).toFixed(2)
    return {
      path,
      total: formatBytes(total),
      used: formatBytes(used),
      available: formatBytes(available),
      usedPercent: `${usedPercent}%`,
    }
  } catch (err) {
    console.error(`Error getting disk stats for path "${path}":`, err)
    return null
  }
}

async function getNetworkStats() {
  const stats = await osu.netstat.stats()
  return stats.map((iface) => ({
    interface: iface.interface,
    inputBytes: formatBytes(iface.inputBytes),
    outputBytes: formatBytes(iface.outputBytes),
    totalBytes: formatBytes(Number.parseInt(iface.inputBytes) + Number.parseInt(iface.outputBytes)),
  }))
}

exports.getStats = async function getStats() {
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const usedMemPercent = ((usedMem / totalMem) * 100).toFixed(2)
  const uptime = os.uptime()
  const cpuUsage = await osu.cpu.usage()
  const cpus = os.cpus()
  const diskStats = await getDiskStats()
  const networkStats = await getNetworkStats()

  return {
    cpu: `${cpuUsage.toFixed(2)}%`,
    cpu_name: cpus[0]?.model || "Unknown",
    ram: `${usedMemPercent}%`,
    uptime,
    ram_text: `${formatBytes(usedMem)} / ${formatBytes(totalMem)} (${usedMemPercent}%)`,
    platform: os.platform(),
    architecture: os.arch(),
    cpu_cores: cpus.length,
    hostname: os.hostname(),
    load_average: os.loadavg(),
    disk: diskStats,
    network: networkStats,
  }
}