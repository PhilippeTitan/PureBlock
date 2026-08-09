require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

// --- Middleware ---
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
  ],
}));
app.use(express.json());

// --- Health ---
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: e.message });
  }
});

// --- Profiles ---
app.get('/api/profiles', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/profiles', async (req, res) => {
  const { id, name, isActive, createdAt, updatedAt, userId } = req.body;
  if (!id || !userId) return res.status(400).json({ error: 'id and userId required' });
  try {
    await pool.query(
      `INSERT INTO profiles (id, user_id, name, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET name=$3, is_active=$4, updated_at=$6`,
      [id, userId, name, isActive ?? true, createdAt, updatedAt]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Blocked Apps ---
app.get('/api/blocked-apps', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM blocked_apps WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows.map(r => ({
      id: r.id,
      profileId: r.profile_id,
      packageName: r.package_name,
      appName: r.app_name,
      isActive: r.is_active,
      createdAt: r.created_at,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/blocked-apps', async (req, res) => {
  const { id, profileId, packageName, appName, isActive, createdAt, userId } = req.body;
  if (!id || !userId) return res.status(400).json({ error: 'id and userId required' });
  try {
    await pool.query(
      `INSERT INTO blocked_apps (id, user_id, profile_id, package_name, app_name, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET profile_id=$3, app_name=$5, is_active=$6`,
      [id, userId, profileId, packageName, appName, isActive ?? true, createdAt]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Blocked Websites ---
app.get('/api/blocked-websites', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM blocked_websites WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows.map(r => ({
      id: r.id,
      profileId: r.profile_id,
      url: r.url,
      isActive: r.is_active,
      createdAt: r.created_at,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/blocked-websites', async (req, res) => {
  const { id, profileId, url, isActive, createdAt, userId } = req.body;
  if (!id || !userId) return res.status(400).json({ error: 'id and userId required' });
  try {
    await pool.query(
      `INSERT INTO blocked_websites (id, user_id, profile_id, url, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET profile_id=$3, url=$4, is_active=$5`,
      [id, userId, profileId, url, isActive ?? true, createdAt]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Schedules ---
app.get('/api/schedules', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM schedules WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows.map(r => ({
      id: r.id,
      profileId: r.profile_id,
      dayOfWeek: r.day_of_week,
      startTime: r.start_time,
      endTime: r.end_time,
      isActive: r.is_active,
      createdAt: r.created_at,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/schedules', async (req, res) => {
  const { id, profileId, dayOfWeek, startTime, endTime, isActive, createdAt, userId } = req.body;
  if (!id || !userId) return res.status(400).json({ error: 'id and userId required' });
  try {
    await pool.query(
      `INSERT INTO schedules (id, user_id, profile_id, day_of_week, start_time, end_time, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET profile_id=$3, day_of_week=$4, start_time=$5, end_time=$6, is_active=$7`,
      [id, userId, profileId, dayOfWeek, startTime, endTime, isActive ?? true, createdAt]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Catch-all ---
app.get('*', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`PureBlock API running on port ${PORT}`);
});
