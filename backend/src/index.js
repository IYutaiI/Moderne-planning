import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Servir les fichiers statiques du frontend en production
const publicPath = process.env.NODE_ENV === 'production'
  ? join(__dirname, '../public')
  : join(__dirname, '../../frontend/dist');
app.use(express.static(publicPath));

// Database setup
const dataDir = process.env.NODE_ENV === 'production'
  ? '/app/data'
  : join(__dirname, '../data');

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'lol-scheduler.db');
console.log(`Database path: ${dbPath}`);
const db = new Database(dbPath);

// Helper functions for password hashing
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

const generateToken = () => crypto.randomBytes(32).toString('hex');

// Initialize tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'joueur',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Sessions table
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Teams table
  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    join_code TEXT UNIQUE,
    owner_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Team members (link users to teams)
  CREATE TABLE IF NOT EXISTS team_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    membership_type TEXT DEFAULT 'main',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(team_id, user_id)
  );

  -- Members (roster)
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    pseudo TEXT NOT NULL,
    riot_id TEXT,
    discord TEXT,
    role TEXT NOT NULL,
    rank TEXT,
    main_champions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  -- Availabilities
  CREATE TABLE IF NOT EXISTS availabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    week_start TEXT,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- Events
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    event_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  -- Event participants
  CREATE TABLE IF NOT EXISTS event_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- Compositions/Strategies
  CREATE TABLE IF NOT EXISTS compositions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    name TEXT NOT NULL,
    champions TEXT NOT NULL,
    bans TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  -- Game History
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id TEXT NOT NULL,
    opponent TEXT,
    result TEXT NOT NULL,
    duration INTEGER,
    game_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  -- Game player stats
  CREATE TABLE IF NOT EXISTS game_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    member_id INTEGER,
    pseudo TEXT NOT NULL,
    champion TEXT,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    cs INTEGER DEFAULT 0,
    gold INTEGER DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
  );
`);

// Migrations for existing tables
const migrations = [
  "ALTER TABLE teams ADD COLUMN owner_id INTEGER",
  "ALTER TABLE members ADD COLUMN team_id TEXT",
  "ALTER TABLE events ADD COLUMN team_id TEXT",
  "ALTER TABLE availabilities ADD COLUMN week_start TEXT",
  "ALTER TABLE availabilities ADD COLUMN status TEXT DEFAULT 'available'",
  "ALTER TABLE members ADD COLUMN riot_id TEXT",
  "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'joueur'",
  "ALTER TABLE teams ADD COLUMN join_code TEXT",
  "ALTER TABLE team_users ADD COLUMN membership_type TEXT DEFAULT 'main'"
];

migrations.forEach(sql => {
  try { db.exec(sql); } catch (e) { /* Column already exists */ }
});

// Generate join codes for existing teams without one
const generateJoinCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const teamsWithoutCode = db.prepare('SELECT id FROM teams WHERE join_code IS NULL').all();
teamsWithoutCode.forEach(team => {
  const code = generateJoinCode();
  db.prepare('UPDATE teams SET join_code = ? WHERE id = ?').run(code, team.id);
});

// ============ AUTH MIDDLEWARE ============
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  const session = db.prepare(`
    SELECT s.*, u.id as user_id, u.username, u.email, u.role as user_role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token);

  if (!session) {
    return res.status(401).json({ error: 'Session invalide ou expiree' });
  }

  req.user = {
    id: session.user_id,
    username: session.username,
    email: session.email,
    role: session.user_role || 'joueur'
  };
  next();
};

// Check if user has access to team
const checkTeamAccess = (req, res, next) => {
  const teamId = req.params.teamId || req.query.team_id || req.body.team_id;
  if (!teamId) {
    return next();
  }

  const access = db.prepare(`
    SELECT * FROM team_users WHERE team_id = ? AND user_id = ?
  `).get(teamId, req.user.id);

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId);

  if (!access && team?.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Acces refuse a cette equipe' });
  }

  req.teamRole = access?.role || (team?.owner_id === req.user.id ? 'owner' : null);
  next();
};

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caracteres' });
  }

  const validRoles = ['joueur', 'manager', 'coach'];
  const userRole = validRoles.includes(role) ? role : 'joueur';

  try {
    const hashedPassword = hashPassword(password);
    const result = db.prepare(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(username, email, hashedPassword, userRole);

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
    ).run(result.lastInsertRowid, token, expiresAt);

    res.json({
      user: { id: result.lastInsertRowid, username, email, role: userRole },
      token
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Nom d\'utilisateur ou email deja utilise' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
  ).run(user.id, token, expiresAt);

  res.json({
    user: { id: user.id, username: user.username, email: user.email, role: user.role || 'joueur' },
    token
  });
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.json({ success: true });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ============ TEAMS ROUTES ============

// Get user's teams with membership info
app.get('/api/teams', authenticateToken, (req, res) => {
  const teams = db.prepare(`
    SELECT DISTINCT t.*, tu.membership_type, tu.role as team_role
    FROM teams t
    LEFT JOIN team_users tu ON t.id = tu.team_id AND tu.user_id = ?
    WHERE t.owner_id = ? OR tu.user_id = ?
    ORDER BY t.created_at DESC
  `).all(req.user.id, req.user.id, req.user.id);
  res.json(teams);
});

// Get team by ID
app.get('/api/teams/:teamId', authenticateToken, checkTeamAccess, (req, res) => {
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.teamId);
  if (!team) return res.status(404).json({ error: 'Equipe non trouvee' });

  const members = db.prepare(`
    SELECT tu.*, u.username, u.email
    FROM team_users tu
    JOIN users u ON tu.user_id = u.id
    WHERE tu.team_id = ?
  `).all(req.params.teamId);

  res.json({ ...team, members });
});

// Create team
app.post('/api/teams', authenticateToken, (req, res) => {
  const { id, name, tag } = req.body;

  if (!name || !tag) {
    return res.status(400).json({ error: 'Nom et tag requis' });
  }

  // Only managers and coaches can create teams
  if (req.user.role === 'joueur') {
    return res.status(403).json({ error: 'Seuls les managers et coachs peuvent creer des equipes' });
  }

  const teamId = id || `team_${Date.now()}`;
  const joinCode = generateJoinCode();

  try {
    db.prepare(
      'INSERT INTO teams (id, name, tag, join_code, owner_id) VALUES (?, ?, ?, ?, ?)'
    ).run(teamId, name, tag, joinCode, req.user.id);

    // Add owner to team_users with their role type
    const membershipType = req.user.role; // manager or coach
    db.prepare(
      'INSERT INTO team_users (team_id, user_id, role, membership_type) VALUES (?, ?, ?, ?)'
    ).run(teamId, req.user.id, 'owner', membershipType);

    res.json({ id: teamId, name, tag, join_code: joinCode, owner_id: req.user.id });
  } catch (error) {
    res.status(400).json({ error: 'Erreur creation equipe' });
  }
});

// Update team
app.put('/api/teams/:teamId', authenticateToken, checkTeamAccess, (req, res) => {
  const { name, tag } = req.body;
  db.prepare('UPDATE teams SET name = ?, tag = ? WHERE id = ?').run(name, tag, req.params.teamId);
  res.json({ id: req.params.teamId, name, tag });
});

// Delete team
app.delete('/api/teams/:teamId', authenticateToken, checkTeamAccess, (req, res) => {
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.teamId);
  if (team.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Seul le proprietaire peut supprimer l\'equipe' });
  }

  db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.teamId);
  res.json({ success: true });
});

// Invite user to team
app.post('/api/teams/:teamId/invite', authenticateToken, checkTeamAccess, (req, res) => {
  const { email } = req.body;

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouve' });
  }

  try {
    db.prepare(
      'INSERT INTO team_users (team_id, user_id, role) VALUES (?, ?, ?)'
    ).run(req.params.teamId, user.id, 'member');
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Utilisateur deja dans l\'equipe' });
  }
});

// Join team by code
app.post('/api/teams/join', authenticateToken, (req, res) => {
  const { join_code, membership_type } = req.body;

  if (!join_code) {
    return res.status(400).json({ error: 'Code requis' });
  }

  const team = db.prepare('SELECT * FROM teams WHERE join_code = ?').get(join_code.toUpperCase());
  if (!team) {
    return res.status(404).json({ error: 'Code invalide' });
  }

  // Check if already in team
  const existing = db.prepare('SELECT * FROM team_users WHERE team_id = ? AND user_id = ?').get(team.id, req.user.id);
  if (existing) {
    return res.status(400).json({ error: 'Vous etes deja dans cette equipe' });
  }

  // For players: validate membership type
  if (req.user.role === 'joueur') {
    const validTypes = ['main', 'sub'];
    const type = validTypes.includes(membership_type) ? membership_type : 'sub';

    // Check if player already has a main team
    if (type === 'main') {
      const hasMain = db.prepare(`
        SELECT * FROM team_users WHERE user_id = ? AND membership_type = 'main'
      `).get(req.user.id);

      if (hasMain) {
        return res.status(400).json({ error: 'Vous avez deja une equipe principale. Rejoignez en tant que sub.' });
      }
    }

    db.prepare(
      'INSERT INTO team_users (team_id, user_id, role, membership_type) VALUES (?, ?, ?, ?)'
    ).run(team.id, req.user.id, 'member', type);

    res.json({ success: true, team: { ...team, membership_type: type } });
  } else {
    // Manager/Coach joins as their role type
    db.prepare(
      'INSERT INTO team_users (team_id, user_id, role, membership_type) VALUES (?, ?, ?, ?)'
    ).run(team.id, req.user.id, 'staff', req.user.role);

    res.json({ success: true, team: { ...team, membership_type: req.user.role } });
  }
});

// Leave team
app.post('/api/teams/:teamId/leave', authenticateToken, (req, res) => {
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.teamId);
  if (team.owner_id === req.user.id) {
    return res.status(400).json({ error: 'Le proprietaire ne peut pas quitter l\'equipe' });
  }

  db.prepare('DELETE FROM team_users WHERE team_id = ? AND user_id = ?').run(req.params.teamId, req.user.id);
  res.json({ success: true });
});

// ============ MEMBERS ROUTES ============

app.get('/api/members', authenticateToken, (req, res) => {
  const { team_id } = req.query;
  if (!team_id) {
    return res.status(400).json({ error: 'team_id requis' });
  }
  const members = db.prepare('SELECT * FROM members WHERE team_id = ? ORDER BY role, pseudo').all(team_id);
  res.json(members);
});

app.post('/api/members', authenticateToken, checkTeamAccess, (req, res) => {
  const { pseudo, riot_id, discord, role, rank, main_champions, team_id } = req.body;
  if (!pseudo || !role || !team_id) {
    return res.status(400).json({ error: 'Pseudo, role et team_id requis' });
  }
  const result = db.prepare(
    'INSERT INTO members (pseudo, riot_id, discord, role, rank, main_champions, team_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(pseudo, riot_id, discord, role, rank, main_champions, team_id);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/members/:id', authenticateToken, (req, res) => {
  const { pseudo, riot_id, discord, role, rank, main_champions } = req.body;
  db.prepare(
    'UPDATE members SET pseudo = ?, riot_id = ?, discord = ?, role = ?, rank = ?, main_champions = ? WHERE id = ?'
  ).run(pseudo, riot_id, discord, role, rank, main_champions, req.params.id);
  res.json({ id: parseInt(req.params.id), ...req.body });
});

app.delete('/api/members/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ COMPOSITIONS ROUTES ============

app.get('/api/compositions', authenticateToken, (req, res) => {
  const { team_id } = req.query;
  if (!team_id) {
    return res.status(400).json({ error: 'team_id requis' });
  }
  const compositions = db.prepare('SELECT * FROM compositions WHERE team_id = ? ORDER BY updated_at DESC').all(team_id);
  res.json(compositions.map(c => ({
    ...c,
    champions: JSON.parse(c.champions),
    bans: c.bans ? JSON.parse(c.bans) : []
  })));
});

app.post('/api/compositions', authenticateToken, checkTeamAccess, (req, res) => {
  const { name, champions, bans, team_id } = req.body;
  if (!name || !team_id) {
    return res.status(400).json({ error: 'Nom et team_id requis' });
  }
  const result = db.prepare(
    'INSERT INTO compositions (team_id, name, champions, bans) VALUES (?, ?, ?, ?)'
  ).run(team_id, name, JSON.stringify(champions), JSON.stringify(bans || []));
  res.json({ id: result.lastInsertRowid, name, champions, bans, team_id });
});

app.put('/api/compositions/:id', authenticateToken, (req, res) => {
  const { name, champions, bans } = req.body;
  const now = new Date().toISOString();
  db.prepare(
    'UPDATE compositions SET name = ?, champions = ?, bans = ?, updated_at = ? WHERE id = ?'
  ).run(name, JSON.stringify(champions), JSON.stringify(bans || []), now, req.params.id);
  res.json({ id: parseInt(req.params.id), name, champions, bans, updated_at: now });
});

app.delete('/api/compositions/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM compositions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ GAMES HISTORY ROUTES ============

app.get('/api/games', authenticateToken, (req, res) => {
  const { team_id } = req.query;
  if (!team_id) {
    return res.status(400).json({ error: 'team_id requis' });
  }

  const games = db.prepare('SELECT * FROM games WHERE team_id = ? ORDER BY game_date DESC, created_at DESC').all(team_id);

  const gamesWithPlayers = games.map(game => {
    const players = db.prepare('SELECT * FROM game_players WHERE game_id = ?').all(game.id);
    return { ...game, players };
  });

  res.json(gamesWithPlayers);
});

app.post('/api/games', authenticateToken, checkTeamAccess, (req, res) => {
  const { team_id, opponent, result, duration, game_date, players } = req.body;

  if (!team_id || !result || !game_date) {
    return res.status(400).json({ error: 'team_id, result et game_date requis' });
  }

  const gameResult = db.prepare(
    'INSERT INTO games (team_id, opponent, result, duration, game_date) VALUES (?, ?, ?, ?, ?)'
  ).run(team_id, opponent, result, duration, game_date);

  const gameId = gameResult.lastInsertRowid;

  if (players && players.length > 0) {
    const insertPlayer = db.prepare(
      'INSERT INTO game_players (game_id, member_id, pseudo, champion, kills, deaths, assists, cs, gold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    for (const player of players) {
      insertPlayer.run(
        gameId,
        player.memberId || null,
        player.pseudo,
        player.champion,
        player.kills || 0,
        player.deaths || 0,
        player.assists || 0,
        player.cs || 0,
        player.gold || 0
      );
    }
  }

  res.json({ id: gameId, team_id, opponent, result, duration, game_date, players });
});

app.delete('/api/games/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ AVAILABILITIES ROUTES ============

app.get('/api/members/:id/availabilities', authenticateToken, (req, res) => {
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

app.post('/api/members/:id/availabilities', authenticateToken, (req, res) => {
  const { day_of_week, start_time, end_time, status, week_start } = req.body;
  const result = db.prepare(
    'INSERT INTO availabilities (member_id, day_of_week, start_time, end_time, status, week_start) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.params.id, day_of_week, start_time, end_time, status || 'available', week_start || null);
  res.json({ id: result.lastInsertRowid, member_id: parseInt(req.params.id), ...req.body });
});

app.delete('/api/members/:id/availabilities', authenticateToken, (req, res) => {
  const { week_start } = req.query;
  if (week_start) {
    db.prepare('DELETE FROM availabilities WHERE member_id = ? AND week_start = ?').run(req.params.id, week_start);
  } else {
    db.prepare('DELETE FROM availabilities WHERE member_id = ?').run(req.params.id);
  }
  res.json({ success: true });
});

app.get('/api/availabilities/team', authenticateToken, (req, res) => {
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

// ============ EVENTS ROUTES ============

app.get('/api/events', authenticateToken, (req, res) => {
  const { team_id } = req.query;
  let events;
  if (team_id) {
    events = db.prepare('SELECT * FROM events WHERE team_id = ? ORDER BY event_date, start_time').all(team_id);
  } else {
    events = db.prepare('SELECT * FROM events ORDER BY event_date, start_time').all();
  }
  res.json(events);
});

app.post('/api/events', authenticateToken, checkTeamAccess, (req, res) => {
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

app.delete('/api/events/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ STATS ROUTES ============

app.get('/api/stats', authenticateToken, (req, res) => {
  const { team_id } = req.query;

  if (team_id) {
    const memberCount = db.prepare('SELECT COUNT(*) as count FROM members WHERE team_id = ?').get(team_id);
    const upcomingEvents = db.prepare(
      "SELECT COUNT(*) as count FROM events WHERE team_id = ? AND event_date >= date('now')"
    ).get(team_id);
    const nextEvent = db.prepare(
      "SELECT * FROM events WHERE team_id = ? AND event_date >= date('now') ORDER BY event_date, start_time LIMIT 1"
    ).get(team_id);

    res.json({
      memberCount: memberCount.count,
      upcomingEvents: upcomingEvents.count,
      nextEvent
    });
  } else {
    res.json({ memberCount: 0, upcomingEvents: 0, nextEvent: null });
  }
});

// Fallback pour SPA
app.get('*', (req, res) => {
  res.sendFile(join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎮 LoL Team Scheduler API running on port ${PORT}`);
});
