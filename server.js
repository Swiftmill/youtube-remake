import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { body, query, validationResult } from 'express-validator';
import { nanoid } from 'nanoid';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_ROOT = process.env.DATA_ROOT ? path.resolve(process.env.DATA_ROOT) : path.join(__dirname, 'data');
const DATA_DIR = DATA_ROOT;
const VIDEO_DIR = path.join(DATA_DIR, 'videos');
const PENDING_DIR = path.join(DATA_DIR, 'pending');
const META_DIR = path.join(DATA_DIR, 'meta');
const USER_DIR = path.join(__dirname, 'users');
const PUBLIC_DIR = path.join(__dirname, 'public');

const JWT_SECRET = process.env.JWT_SECRET || 'youtube.lol-secret-change-me';
const PORT = process.env.PORT || 4000;
const MAX_UPLOAD_SIZE = 500 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir('/tmp/youtube.lol', { recursive: true });
      cb(null, '/tmp/youtube.lol');
    } catch (error) {
      cb(error, '/tmp');
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Supported: mp4, mov, webm.'));
    }
    cb(null, true);
  }
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/public', express.static(PUBLIC_DIR));
app.use('/media', express.static(DATA_DIR));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false
});

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter);
app.use('/api/register', authLimiter);
app.use('/api/login', authLimiter);

async function ensureDirectories() {
  await Promise.all([
    fs.mkdir(DATA_DIR, { recursive: true }),
    fs.mkdir(VIDEO_DIR, { recursive: true }),
    fs.mkdir(PENDING_DIR, { recursive: true }),
    fs.mkdir(META_DIR, { recursive: true }),
    fs.mkdir(USER_DIR, { recursive: true }),
    fs.mkdir(PUBLIC_DIR, { recursive: true })
  ]);
}

async function readJSON(filePath, fallback = null) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== null) {
      return fallback;
    }
    throw error;
  }
}

async function writeJSON(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function listJSONFiles(dir) {
  const entries = await fs.readdir(dir).catch(() => []);
  return entries.filter((file) => file.endsWith('.json'));
}

async function loadUser(username) {
  const file = path.join(USER_DIR, `${username}.json`);
  return readJSON(file).catch(() => null);
}

async function saveUser(user) {
  const file = path.join(USER_DIR, `${user.username}.json`);
  await writeJSON(file, user);
}

function toPublicVideo(videoMeta) {
  const { comments = [], likes = 0, dislikes = 0, views = 0, ...rest } = videoMeta;
  return {
    ...rest,
    commentsCount: comments.length,
    likes,
    dislikes,
    views,
    comments
  };
}

function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim();
}

function createToken(user) {
  return jwt.sign(
    {
      username: user.username,
      role: user.role,
      verified: user.verified || false
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

function authenticate(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
      if (!required) return next();
      return res.status(401).json({ message: 'Authentication required' });
    }
    const token = header.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
}

async function loadVideoMeta(videoId) {
  const file = path.join(META_DIR, `${videoId}.json`);
  return readJSON(file).catch(() => null);
}

async function saveVideoMeta(meta) {
  const file = path.join(META_DIR, `${meta.id}.json`);
  await writeJSON(file, meta);
  return meta;
}

async function fetchPublishedVideos() {
  const files = await listJSONFiles(META_DIR);
  const videos = [];
  for (const file of files) {
    const meta = await readJSON(path.join(META_DIR, file));
    if (meta.status === 'published') {
      const record = toPublicVideo(meta);
      const uploader = await loadUser(meta.uploader);
      record.uploaderDisplayName = uploader?.displayName || meta.uploader;
      record.uploaderVerified = uploader?.verified || false;
      videos.push(record);
    }
  }
  return videos.sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
}

app.post(
  '/api/register',
  [
    body('username').isString().isLength({ min: 3, max: 20 }).trim().escape(),
    body('password').isLength({ min: 8 }),
    body('email').isEmail().normalizeEmail(),
    body('displayName').optional().isLength({ min: 1, max: 50 }).trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password, email, displayName } = req.body;
    const existing = await loadUser(username);
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      username,
      passwordHash,
      email,
      displayName: displayName || username,
      role: 'creator',
      verified: false,
      createdAt: new Date().toISOString()
    };
    await saveUser(user);
    const token = createToken(user);
    res.status(201).json({ token, user: { username: user.username, displayName: user.displayName, verified: user.verified } });
  }
);

app.post(
  '/api/login',
  [body('username').isString(), body('password').isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    const user = await loadUser(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = createToken(user);
    res.json({ token, user: { username: user.username, displayName: user.displayName, role: user.role, verified: user.verified } });
  }
);

app.get('/api/home', authenticate(false), async (req, res) => {
  const videos = await fetchPublishedVideos();
  res.json({ videos });
});

app.get('/api/videos/:id', authenticate(false), async (req, res) => {
  const video = await loadVideoMeta(req.params.id);
  if (!video || video.status !== 'published') {
    return res.status(404).json({ message: 'Video not found' });
  }
  const meta = toPublicVideo(video);
  const uploader = await loadUser(video.uploader);
  meta.uploaderDisplayName = uploader?.displayName || video.uploader;
  meta.verified = uploader?.verified || false;
  meta.views = (meta.views || 0) + 1;
  video.views = meta.views;
  await saveVideoMeta(video);
  res.json(meta);
});

app.get('/api/channel/:username', authenticate(false), async (req, res) => {
  const user = await loadUser(req.params.username);
  if (!user) {
    return res.status(404).json({ message: 'Channel not found' });
  }
  const files = await listJSONFiles(META_DIR);
  const videos = [];
  for (const file of files) {
    const meta = await readJSON(path.join(META_DIR, file));
    if (meta.uploader === user.username && meta.status === 'published') {
      const record = toPublicVideo(meta);
      record.uploaderDisplayName = user.displayName;
      record.uploaderVerified = user.verified || false;
      videos.push(record);
    }
  }
  res.json({
    channel: {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio || '',
      avatar: user.avatar || '',
      banner: user.banner || '',
      verified: user.verified || false,
      subscribers: user.subscribers || 0
    },
    videos
  });
});

app.get(
  '/api/search',
  [query('q').isString().isLength({ min: 1 })],
  authenticate(false),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const q = sanitize(req.query.q).toLowerCase();
    const videos = await fetchPublishedVideos();
    const filtered = videos.filter((video) => {
      const haystack = [video.title, video.description, (video.tags || []).join(' '), video.uploader]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
    res.json({ results: filtered });
  }
);

app.post(
  '/api/videos',
  authenticate(true),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  [
    body('title').isString().isLength({ min: 3, max: 120 }).trim(),
    body('description').isString().isLength({ min: 3, max: 2000 }).trim(),
    body('tags').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await loadUser(req.user.username);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const videoFile = req.files?.video?.[0];
    if (!videoFile) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const thumbnailFile = req.files?.thumbnail?.[0];
    if (!thumbnailFile) {
      return res.status(400).json({ message: 'Thumbnail image is required' });
    }

    const usernameDir = path.join(PENDING_DIR, user.username);
    await fs.mkdir(usernameDir, { recursive: true });

    const videoExtension = mime.extension(videoFile.mimetype) || 'mp4';
    const videoId = nanoid(12);
    const pendingVideoName = `${videoId}.${videoExtension}`;
    const pendingThumbnailName = `${videoId}.jpg`;

    await fs.rename(videoFile.path, path.join(usernameDir, pendingVideoName));
    await fs.rename(thumbnailFile.path, path.join(usernameDir, pendingThumbnailName));

    const meta = {
      id: videoId,
      title: sanitize(req.body.title),
      description: sanitize(req.body.description),
      tags: req.body.tags ? req.body.tags.split(',').map((tag) => sanitize(tag)) : [],
      uploader: user.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: [],
      pendingPaths: {
        video: path.join(usernameDir, pendingVideoName),
        thumbnail: path.join(usernameDir, pendingThumbnailName)
      }
    };

    await saveVideoMeta(meta);

    res.status(201).json({ message: 'Upload received and pending review', videoId });
  }
);

app.post(
  '/api/videos/:id/comments',
  authenticate(true),
  [body('message').isString().isLength({ min: 1, max: 500 }).trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const video = await loadVideoMeta(req.params.id);
    if (!video || video.status !== 'published') {
      return res.status(404).json({ message: 'Video not found' });
    }
    const comment = {
      id: nanoid(8),
      author: req.user.username,
      message: sanitize(req.body.message),
      createdAt: new Date().toISOString(),
      likes: 0
    };
    video.comments = video.comments || [];
    video.comments.push(comment);
    video.updatedAt = new Date().toISOString();
    await saveVideoMeta(video);
    res.status(201).json(comment);
  }
);

app.post('/api/videos/:id/reactions', authenticate(true), [body('type').isIn(['like', 'dislike'])], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const video = await loadVideoMeta(req.params.id);
  if (!video || video.status !== 'published') {
    return res.status(404).json({ message: 'Video not found' });
  }
  if (req.body.type === 'like') {
    video.likes = (video.likes || 0) + 1;
  } else {
    video.dislikes = (video.dislikes || 0) + 1;
  }
  video.updatedAt = new Date().toISOString();
  await saveVideoMeta(video);
  res.json({ likes: video.likes, dislikes: video.dislikes });
});

app.get('/api/admin/pending', authenticate(true), requireAdmin, async (req, res) => {
  const files = await listJSONFiles(META_DIR);
  const pending = [];
  for (const file of files) {
    const meta = await readJSON(path.join(META_DIR, file));
    if (meta.status === 'pending') {
      pending.push(meta);
    }
  }
  res.json({ pending });
});

app.post(
  '/api/admin/videos/:id/approve',
  authenticate(true),
  requireAdmin,
  [
    body('title').optional().isString().isLength({ min: 3, max: 120 }).trim(),
    body('description').optional().isString().isLength({ min: 3, max: 2000 }).trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const video = await loadVideoMeta(req.params.id);
    if (!video || video.status !== 'pending') {
      return res.status(404).json({ message: 'Pending video not found' });
    }

    const uploaderDir = path.join(VIDEO_DIR, video.uploader);
    await fs.mkdir(uploaderDir, { recursive: true });

    const { video: pendingVideoPath, thumbnail: pendingThumbPath } = video.pendingPaths;
    const approvedVideoName = path.basename(pendingVideoPath);
    const approvedThumbName = path.basename(pendingThumbPath);

    await fs.rename(pendingVideoPath, path.join(uploaderDir, approvedVideoName));
    await fs.rename(pendingThumbPath, path.join(uploaderDir, approvedThumbName));

    video.status = 'published';
    video.publishedAt = new Date().toISOString();
    video.updatedAt = new Date().toISOString();
    video.videoPath = path.posix.join('/media/videos', video.uploader, approvedVideoName);
    video.thumbnailPath = path.posix.join('/media/videos', video.uploader, approvedThumbName);
    delete video.pendingPaths;

    if (req.body.title) video.title = sanitize(req.body.title);
    if (req.body.description) video.description = sanitize(req.body.description);

    await saveVideoMeta(video);

    res.json({ message: 'Video approved', video: toPublicVideo(video) });
  }
);

app.post('/api/admin/videos/:id/reject', authenticate(true), requireAdmin, async (req, res) => {
  const video = await loadVideoMeta(req.params.id);
  if (!video || video.status !== 'pending') {
    return res.status(404).json({ message: 'Pending video not found' });
  }
  const { video: pendingVideoPath, thumbnail: pendingThumbPath } = video.pendingPaths;
  await Promise.all([
    fs.rm(pendingVideoPath, { force: true }),
    fs.rm(pendingThumbPath, { force: true })
  ]);
  await fs.rm(path.join(META_DIR, `${video.id}.json`));
  res.json({ message: 'Video rejected and removed' });
});

app.post('/api/admin/users/:username/verify', authenticate(true), requireAdmin, async (req, res) => {
  const user = await loadUser(req.params.username);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.verified = true;
  user.updatedAt = new Date().toISOString();
  await saveUser(user);
  res.json({ message: 'User verified' });
});

app.post('/api/admin/users/:username/quota', authenticate(true), requireAdmin, [body('limit').isInt({ min: 1 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = await loadUser(req.params.username);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.quotaLimitMb = Number(req.body.limit);
  await saveUser(user);
  res.json({ message: 'Quota updated' });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unexpected server error' });
  }
  next();
});

await ensureDirectories();

app.listen(PORT, () => {
  console.log(`YouTube.lol backend running on http://localhost:${PORT}`);
});
