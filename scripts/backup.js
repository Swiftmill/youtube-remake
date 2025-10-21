#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const USERS_DIR = path.join(ROOT, 'users');

async function createBackup() {
  await fs.mkdir(path.join(ROOT, 'backups'), { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(ROOT, 'backups', `youtube-lol-${timestamp}.zip`);
  const output = createWriteStream(archivePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(DATA_DIR, 'data');
  archive.directory(USERS_DIR, 'users');

  await archive.finalize();
  console.log(`Backup created at ${archivePath}`);
}

createBackup().catch((error) => {
  console.error('Backup failed:', error);
  process.exitCode = 1;
});
