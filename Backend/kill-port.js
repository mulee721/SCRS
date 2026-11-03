// Kills whatever process is holding port 3000 before NestJS starts
const { execSync } = require('child_process');
try {
  const result = execSync('netstat -ano | findstr :3000', { encoding: 'utf8' });
  const lines = result.split('\n').filter(l => l.includes('LISTENING'));
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0') {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`Killed PID ${pid} holding port 3000`);
      } catch (_) {}
    }
  });
} catch (_) {
  // nothing using port 3000 — good
}
