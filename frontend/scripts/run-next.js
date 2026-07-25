import { createServer } from 'net';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const initialPort = parseInt(process.env.PORT || '3000', 10);
const mode = process.argv[2] === 'start' ? 'start' : 'dev';

function testPortHost(port, host) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

async function isPortAvailable(port) {
  const [ipv4Free, ipv6Free] = await Promise.all([
    testPortHost(port, '127.0.0.1'),
    testPortHost(port, '::')
  ]);
  return ipv4Free && ipv6Free;
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (port < startPort + 50) {
    if (await isPortAvailable(port)) {
      return port;
    }
    console.log(`[SupplySense AI] Port ${port} is occupied, checking port ${port + 1}...`);
    port++;
  }
  return startPort;
}

function clearStaleDevLock() {
  try {
    const logDir = path.join(process.cwd(), '.next', 'dev', 'logs');
    if (fs.existsSync(logDir)) {
      fs.rmSync(logDir, { recursive: true, force: true });
    }
  } catch {
    // Ignore cleanup errors
  }
}

async function main() {
  const selectedPort = await findAvailablePort(initialPort);
  console.log(`\n🚀 Launching Next.js ${mode} server on http://localhost:${selectedPort}...\n`);

  if (mode === 'dev') {
    clearStaleDevLock();
  }

  const command = process.platform === 'win32' ? 'cmd.exe' : 'npx';
  const args = process.platform === 'win32'
    ? ['/c', 'npx', 'next', mode, '-p', selectedPort.toString()]
    : ['next', mode, '-p', selectedPort.toString()];

  const child = spawn(command, args, {
    stdio: 'inherit',
    env: { ...process.env, PORT: selectedPort.toString() }
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main();
