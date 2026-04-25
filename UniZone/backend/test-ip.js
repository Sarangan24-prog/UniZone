const os = require('os');
const networkInterfaces = os.networkInterfaces();
let ip = 'localhost';

const interfaceNames = Object.keys(networkInterfaces);
interfaceNames.sort((a, b) => {
  const isAWifi = a.toLowerCase().includes('wi-fi') || a.toLowerCase().includes('wlan') || a.toLowerCase().includes('wireless');
  const isBWifi = b.toLowerCase().includes('wi-fi') || b.toLowerCase().includes('wlan') || b.toLowerCase().includes('wireless');
  if (isAWifi && !isBWifi) return -1;
  if (!isAWifi && isBWifi) return 1;
  return 0;
});

for (const interfaceName of interfaceNames) {
  const interfaces = networkInterfaces[interfaceName];
  if (interfaceName.toLowerCase().includes('virtual') || 
      interfaceName.toLowerCase().includes('veth') ||
      interfaceName.toLowerCase().includes('wsl') ||
      interfaceName.toLowerCase().includes('hyper-v') ||
      interfaceName.toLowerCase().includes('vmware') ||
      interfaceName.toLowerCase().includes('docker')) {
    continue;
  }
  for (const iface of interfaces) {
    if (iface.family === 'IPv4' && !iface.internal) {
      ip = iface.address;
      break;
    }
  }
  if (ip !== 'localhost') break;
}

console.log("Final detected IP:", ip);
