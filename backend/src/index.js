import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend en production
const publicPath = process.env.NODE_ENV === 'production'
  ? join(__dirname, '../public')
  : join(__dirname, '../../frontend/dist');
app.use(express.static(publicPath));

// Database setup - use /app/data in production, ../data locally
const dataDir = process.env.NODE_ENV === 'production'
  ? '/app/data'
  : join(__dirname, '../data');

// Creer le dossier data si necessaire
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'lol-scheduler.db');
console.log(`Database path: ${dbPath}`);
const db = new Database(dbPath);

// Initialiser les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT,
    pseudo TEXT NOT NULL,
    riot_id TEXT,
    discord TEXT,
    role TEXT NOT NULL,
    rank TEXT,
    main_champions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS availabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    event_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS event_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );
`);

// Migration: ajouter riot_id si la colonne n'existe pas
try {
  db.exec('ALTER TABLE members ADD COLUMN riot_id TEXT');
} catch (e) {
  // La colonne existe deja
}

// Migration: ajouter status aux availabilities
try {
  db.exec("ALTER TABLE availabilities ADD COLUMN status TEXT DEFAULT 'available'");
} catch (e) {
  // La colonne existe deja
}

// Migration: ajouter week_start aux availabilities pour tracker la semaine
try {
  db.exec("ALTER TABLE availabilities ADD COLUMN week_start TEXT");
} catch (e) {
  // La colonne existe deja
}

// Migration: ajouter team_id aux tables existantes
try {
  db.exec('ALTER TABLE members ADD COLUMN team_id TEXT');
} catch (e) {
  // La colonne existe deja
}

try {
  db.exec('ALTER TABLE events ADD COLUMN team_id TEXT');
} catch (e) {
  // La colonne existe deja
}

// ============ ROUTES API ============

// --- Teams ---
app.get('/api/teams', (req, res) => {
  const teams = db.prepare('SELECT * FROM teams ORDER BY created_at DESC').all();
  res.json(teams);
});

app.get('/api/teams/:id', (req, res) => {
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id);
  if (!team) return res.status(404).json({ error: 'Equipe non trouvee' });
  res.json(team);
});

app.post('/api/teams', (req, res) => {
  const { id, name, tag } = req.body;
  if (!id || !name || !tag) {
    return res.status(400).json({ error: 'ID, nom et tag requis' });
  }
  try {
    db.prepare('INSERT INTO teams (id, name, tag) VALUES (?, ?, ?)').run(id, name, tag);
    res.json({ id, name, tag });
  } catch (e) {
    res.status(400).json({ error: 'Equipe deja existante' });
  }
});

app.put('/api/teams/:id', (req, res) => {
  const { name, tag } = req.body;
  db.prepare('UPDATE teams SET name = ?, tag = ? WHERE id = ?').run(name, tag, req.params.id);
  res.json({ id: req.params.id, name, tag });
});

app.delete('/api/teams/:id', (req, res) => {
  // Delete all related data first
  db.prepare('DELETE FROM members WHERE team_id = ?').run(req.params.id);
  db.prepare('DELETE FROM events WHERE team_id = ?').run(req.params.id);
  db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Members ---
app.get('/api/members', (req, res) => {
  const { team_id } = req.query;
  let members;
  if (team_id) {
    members = db.prepare('SELECT * FROM members WHERE team_id = ? ORDER BY role, pseudo').all(team_id);
  } else {
    members = db.prepare('SELECT * FROM members ORDER BY role, pseudo').all();
  }
  res.json(members);
});

app.get('/api/members/:id', (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Membre non trouvé' });
  res.json(member);
});

app.post('/api/members', (req, res) => {
  const { pseudo, riot_id, discord, role, rank, main_champions, team_id } = req.body;
  if (!pseudo || !role) {
    return res.status(400).json({ error: 'Pseudo et rôle requis' });
  }
  const result = db.prepare(
    'INSERT INTO members (pseudo, riot_id, discord, role, rank, main_champions, team_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(pseudo, riot_id, discord, role, rank, main_champions, team_id);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/members/:id', (req, res) => {
  const { pseudo, riot_id, discord, role, rank, main_champions } = req.body;
  db.prepare(
    'UPDATE members SET pseudo = ?, riot_id = ?, discord = ?, role = ?, rank = ?, main_champions = ? WHERE id = ?'
  ).run(pseudo, riot_id, discord, role, rank, main_champions, req.params.id);
  res.json({ id: parseInt(req.params.id), ...req.body });
});

app.delete('/api/members/:id', (req, res) => {
  db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Availabilities ---
app.get('/api/members/:id/availabilities', (req, res) => {
  const { week_start } = req.query;
  let availabilities;
  if (week_start) {
    availabilities = db.prepare(
      'SELECT * FROM availabilities WHERE member_id = ? AND week_start = ? ORDER BY day_of_week, start_time'
    ).all(req.params.id, week_start);
  } else {
    availabilities = db.prepare(
      'SELECT * FROM availabilities WHERE member_id = ? ORDER BY day_of_week, start_time'
    ).all(req.params.id);
  }
  res.json(availabilities);
});

app.post('/api/members/:id/availabilities', (req, res) => {
  const { day_of_week, start_time, end_time, status, week_start } = req.body;
  const result = db.prepare(
    'INSERT INTO availabilities (member_id, day_of_week, start_time, end_time, status, week_start) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.params.id, day_of_week, start_time, end_time, status || 'available', week_start || null);
  res.json({ id: result.lastInsertRowid, member_id: parseInt(req.params.id), ...req.body });
});

app.put('/api/availabilities/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE availabilities SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/availabilities/:id', (req, res) => {
  db.prepare('DELETE FROM availabilities WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Delete all availabilities for a member for a specific week
app.delete('/api/members/:id/availabilities', (req, res) => {
  const { week_start } = req.query;
  if (week_start) {
    db.prepare('DELETE FROM availabilities WHERE member_id = ? AND week_start = ?').run(req.params.id, week_start);
  } else {
    db.prepare('DELETE FROM availabilities WHERE member_id = ?').run(req.params.id);
  }
  res.json({ success: true });
});

app.get('/api/availabilities/team', (req, res) => {
  const { week_start, team_id } = req.query;
  let availabilities;
  if (week_start && team_id) {
    availabilities = db.prepare(`
      SELECT a.*, m.pseudo, m.role
      FROM availabilities a
      JOIN members m ON a.member_id = m.id
      WHERE a.week_start = ? AND m.team_id = ?
      ORDER BY a.day_of_week, a.start_time
    `).all(week_start, team_id);
  } else if (week_start) {
    availabilities = db.prepare(`
      SELECT a.*, m.pseudo, m.role
      FROM availabilities a
      JOIN members m ON a.member_id = m.id
      WHERE a.week_start = ?
      ORDER BY a.day_of_week, a.start_time
    `).all(week_start);
  } else {
    availabilities = db.prepare(`
      SELECT a.*, m.pseudo, m.role
      FROM availabilities a
      JOIN members m ON a.member_id = m.id
      ORDER BY a.day_of_week, a.start_time
    `).all();
  }
  res.json(availabilities);
});

// Copy availabilities from previous week
app.post('/api/members/:id/availabilities/copy-week', (req, res) => {
  const { from_week, to_week } = req.body;
  const memberId = req.params.id;

  // Get previous week availabilities
  const prevAvails = db.prepare(
    'SELECT * FROM availabilities WHERE member_id = ? AND week_start = ?'
  ).all(memberId, from_week);

  if (prevAvails.length === 0) {
    return res.status(404).json({ error: 'Aucune disponibilite trouvee pour la semaine precedente' });
  }

  // Delete current week availabilities first
  db.prepare('DELETE FROM availabilities WHERE member_id = ? AND week_start = ?').run(memberId, to_week);

  // Copy to new week
  const insert = db.prepare(
    'INSERT INTO availabilities (member_id, day_of_week, start_time, end_time, status, week_start) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const avail of prevAvails) {
    insert.run(memberId, avail.day_of_week, avail.start_time, avail.end_time, avail.status, to_week);
  }

  res.json({ success: true, copied: prevAvails.length });
});

// --- Events ---
app.get('/api/events', (req, res) => {
  const { team_id } = req.query;
  let events;
  if (team_id) {
    events = db.prepare('SELECT * FROM events WHERE team_id = ? ORDER BY event_date, start_time').all(team_id);
  } else {
    events = db.prepare('SELECT * FROM events ORDER BY event_date, start_time').all();
  }
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Événement non trouvé' });

  const participants = db.prepare(`
    SELECT ep.*, m.pseudo, m.role
    FROM event_participants ep
    JOIN members m ON ep.member_id = m.id
    WHERE ep.event_id = ?
  `).all(req.params.id);

  res.json({ ...event, participants });
});

app.post('/api/events', (req, res) => {
  const { title, description, event_type, event_date, start_time, end_time, participant_ids, team_id } = req.body;

  const result = db.prepare(
    'INSERT INTO events (title, description, event_type, event_date, start_time, end_time, team_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(title, description, event_type, event_date, start_time, end_time, team_id);

  const eventId = result.lastInsertRowid;

  if (participant_ids && participant_ids.length > 0) {
    const insertParticipant = db.prepare(
      'INSERT INTO event_participants (event_id, member_id) VALUES (?, ?)'
    );
    for (const memberId of participant_ids) {
      insertParticipant.run(eventId, memberId);
    }
  }

  res.json({ id: eventId, ...req.body });
});

app.put('/api/events/:id', (req, res) => {
  const { title, description, event_type, event_date, start_time, end_time } = req.body;
  db.prepare(
    'UPDATE events SET title = ?, description = ?, event_type = ?, event_date = ?, start_time = ?, end_time = ? WHERE id = ?'
  ).run(title, description, event_type, event_date, start_time, end_time, req.params.id);
  res.json({ id: parseInt(req.params.id), ...req.body });
});

app.delete('/api/events/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Event Participants ---
app.post('/api/events/:id/participants', (req, res) => {
  const { member_id, status } = req.body;
  const result = db.prepare(
    'INSERT INTO event_participants (event_id, member_id, status) VALUES (?, ?, ?)'
  ).run(req.params.id, member_id, status || 'pending');
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/event-participants/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE event_participants SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// --- Dashboard Stats ---
app.get('/api/stats', (req, res) => {
  const { team_id } = req.query;
  let memberCount, upcomingEvents, nextEvent;

  if (team_id) {
    memberCount = db.prepare('SELECT COUNT(*) as count FROM members WHERE team_id = ?').get(team_id);
    upcomingEvents = db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE team_id = ? AND event_date >= date('now')"
    ).get(team_id);
    nextEvent = db.prepare(
      "SELECT * FROM events WHERE team_id = ? AND event_date >= date('now') ORDER BY event_date, start_time LIMIT 1"
    ).get(team_id);
  } else {
    memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get();
    upcomingEvents = db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE event_date >= date('now')"
    ).get();
    nextEvent = db.prepare(
      "SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date, start_time LIMIT 1"
    ).get();
  }

  res.json({
    memberCount: memberCount.count,
    upcomingEvents: upcomingEvents.count,
    nextEvent
  });
});

// Fallback pour SPA
app.get('*', (req, res) => {
  res.sendFile(join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎮 LoL Team Scheduler API running on port ${PORT}`);
});
