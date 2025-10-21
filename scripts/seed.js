#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const META_DIR = path.join(DATA_DIR, 'meta');
const VIDEO_DIR = path.join(DATA_DIR, 'videos');
const USERS_DIR = path.join(ROOT, 'users');

const USERS = [
  {
    username: 'admin',
    passwordHash: '$2b$10$wGQZP.3oY9PqJ2Fkhohp7O1LcF.Yb3tIzG3B.gFKFLr0O31HjVQ2C',
    role: 'admin',
    verified: true,
    email: 'admin@youtube.lol',
    displayName: 'Site Administrator',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    username: 'creator',
    passwordHash: '$2b$10$K7aXrDvzM2ymlk/wEYB/7OYG1ChcxrFAuo0xO0jzAm8h1Hn0SI7Rm',
    role: 'creator',
    verified: true,
    email: 'creator@youtube.lol',
    displayName: 'Creator One',
    bio: 'Tech and design deep dives.',
    avatar: '/public/uploads/creator-avatar.jpg',
    banner: '/public/uploads/creator-banner.jpg',
    subscribers: 12500,
    createdAt: '2024-02-01T12:00:00.000Z'
  },
  {
    username: 'explorer',
    passwordHash: '$2b$10$wVvXLqXy2cYOhTWM4j7P9u1KZGJHTz7MKl1I2zlNz6D5x0wh28mTO',
    role: 'creator',
    verified: false,
    email: 'explorer@youtube.lol',
    displayName: 'Urban Explorer',
    bio: 'Hidden gems around the world.',
    avatar: '/public/uploads/explorer-avatar.jpg',
    banner: '/public/uploads/explorer-banner.jpg',
    subscribers: 8300,
    createdAt: '2024-03-15T18:30:00.000Z'
  }
];

const SAMPLE_VIDEO = {
  id: 'sample-video',
  title: 'Design Systems for Creators',
  description: 'An in-depth look at building cohesive design systems for video creators.',
  uploader: 'creator',
  status: 'published',
  publishedAt: '2024-02-10T10:00:00.000Z',
  createdAt: '2024-02-08T20:00:00.000Z',
  duration: 620,
  tags: ['design', 'workflow', 'youtube'],
  views: 12450,
  likes: 850,
  dislikes: 12,
  videoPath: '/media/videos/creator/design-systems.mp4',
  thumbnailPath: '/media/videos/creator/design-systems.jpg',
  comments: [
    {
      id: 'c1',
      author: 'explorer',
      message: 'Loved the motion guidelines section!',
      createdAt: '2024-02-11T09:30:00.000Z',
      likes: 12
    }
  ]
};

async function ensureDirs() {
  await Promise.all([
    fs.mkdir(DATA_DIR, { recursive: true }),
    fs.mkdir(path.join(DATA_DIR, 'pending'), { recursive: true }),
    fs.mkdir(path.join(DATA_DIR, 'videos', 'creator'), { recursive: true }),
    fs.mkdir(path.join(DATA_DIR, 'videos', 'explorer'), { recursive: true }),
    fs.mkdir(META_DIR, { recursive: true }),
    fs.mkdir(USERS_DIR, { recursive: true }),
    fs.mkdir(path.join(ROOT, 'public', 'uploads'), { recursive: true })
  ]);
}

async function seedUsers() {
  for (const user of USERS) {
    const target = path.join(USERS_DIR, `${user.username}.json`);
    await fs.writeFile(target, JSON.stringify(user, null, 2), 'utf-8');
  }
}

async function seedVideo() {
  const metaTarget = path.join(META_DIR, `${SAMPLE_VIDEO.id}.json`);
  await fs.writeFile(metaTarget, JSON.stringify(SAMPLE_VIDEO, null, 2), 'utf-8');

  const videoPath = path.join(DATA_DIR, 'videos', 'creator', 'design-systems.mp4');
  const thumbnailPath = path.join(DATA_DIR, 'videos', 'creator', 'design-systems.jpg');

  await fs.writeFile(videoPath, 'Sample video placeholder', 'utf-8');
  await fs.writeFile(thumbnailPath, 'Sample thumbnail placeholder', 'utf-8');
}

async function main() {
  await ensureDirs();
  await seedUsers();
  await seedVideo();
  console.log('Seed data generated. Default credentials:');
  console.log(' admin / admin123');
  console.log(' creator / creator123');
  console.log(' explorer / explorer123');
}

main().catch((error) => {
  console.error('Failed to seed project:', error);
  process.exitCode = 1;
});
