const si = require('systeminformation');
const os = require("os");
const disk = require("diskusage");
const osu = require("node-os-utils");
const fs = require("fs").promises;
const path = require("path");
const { formatBytes } = require("./utils");

async function getDiskStats(path = "/") {
  try {
    const { available, free, total } = await disk.check(path);
    const used = total - free;
    const usedPercent = ((used / total) * 100).toFixed(2);
    return {
      path,
      total: formatBytes(total),
      used: formatBytes(used),
      available: formatBytes(available),
      usedPercent: `${usedPercent}%`,
    };
  } catch (err) {
    console.error(`Error getting disk stats for path "${path}":`, err);
    return null;
  }
}

async function getNetworkStats() {
  const stats = await osu.netstat.stats();
  return stats.map((iface) => ({
    interface: iface.interface,
    inputBytes: formatBytes(iface.inputBytes),
    outputBytes: formatBytes(iface.outputBytes),
    totalBytes: formatBytes(Number.parseInt(iface.inputBytes) + Number.parseInt(iface.outputBytes)),
  }));
}

async function getTemperatureInfo() {
  try {
    const platform = os.platform();

    if (platform === 'linux') {
      // Logika khusus Linux seperti sebelumnya
      const thermalZonesDir = '/sys/class/thermal';
      try {
        await fs.access(thermalZonesDir);
      } catch (err) {
        console.log("Thermal information directory not accessible");
        return null;
      }

      const thermalItems = await fs.readdir(thermalZonesDir);
      const thermalZones = thermalItems.filter(item => item.startsWith('thermal_zone'));

      if (thermalZones.length === 0) {
        console.log("No thermal zones found");
        return null;
      }

      const temperatures = [];
      for (const zone of thermalZones) {
        try {
          const tempPath = path.join(thermalZonesDir, zone, 'temp');
          const tempContent = await fs.readFile(tempPath, 'utf8');
          const temp = parseInt(tempContent.trim()) / 1000;
          if (!isNaN(temp)) {
            temperatures.push(temp);
          }
        } catch (err) {
          continue;
        }
      }

      if (temperatures.length === 0) {
        return null;
      }

      const avgTemp = temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length;
      return `${avgTemp.toFixed(1)}°C`;
    } else {
      // Windows / macOS: gunakan systeminformation
      const tempData = await si.cpuTemperature();
      if (tempData.main && !isNaN(tempData.main)) {
        return `${tempData.main.toFixed(1)}°C`;
      } else {
        return null;
      }
    }
  } catch (err) {
    console.error("Error getting temperature information:", err);
    return null;
  }
}

exports.getStats = async function getStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usedMemPercent = ((usedMem / totalMem) * 100).toFixed(2);
  const uptime = os.uptime();
  const cpuUsage = await osu.cpu.usage();
  const cpus = os.cpus();
  const diskStats = await getDiskStats();
  const networkStats = await getNetworkStats();
  const tempInfo = await getTemperatureInfo();

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
    temperature: tempInfo,
    disk: diskStats,
    network: networkStats,
  };
};
