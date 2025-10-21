#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const META_DIR = path.join(ROOT, 'data', 'meta');

const AGE_THRESHOLD_DAYS = Number(process.env.PRUNE_THRESHOLD_DAYS || 30);

async function prunePending() {
  const files = await fs.readdir(META_DIR).catch(() => []);
  const cutoff = Date.now() - AGE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  let removed = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const metaPath = path.join(META_DIR, file);
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
    if (meta.status !== 'pending') continue;

    const created = new Date(meta.createdAt || Date.now()).getTime();
    if (created >= cutoff) continue;

    const pendingPaths = meta.pendingPaths || {};
    if (pendingPaths.video) {
      const target = path.isAbsolute(pendingPaths.video)
        ? pendingPaths.video
        : path.join(ROOT, pendingPaths.video);
      await fs.rm(target, { force: true });
    }
    if (pendingPaths.thumbnail) {
      const target = path.isAbsolute(pendingPaths.thumbnail)
        ? pendingPaths.thumbnail
        : path.join(ROOT, pendingPaths.thumbnail);
      await fs.rm(target, { force: true });
    }
    await fs.rm(metaPath, { force: true });
    removed += 1;
  }

  console.log(`Pruned ${removed} stale pending uploads older than ${AGE_THRESHOLD_DAYS} days.`);
}

prunePending().catch((error) => {
  console.error('Prune failed:', error);
  process.exitCode = 1;
});
