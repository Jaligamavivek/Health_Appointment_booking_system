import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const DB_FILE = process.env.DB_FILE || './db.json';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// ✅ Setup lowdb with default data (Fixes the "missing default data" error)
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, { users: [], patients: [], doctors: [], appointments: [] });

// ✅ Initialize DB
async function initDb() {
  await db.read();
  db.data ||= { users: [], patients: [], doctors: [], appointments: [] };

  // Create default admin user if not exists
  if (!db.data.users.find(u => u.username === 'admin')) {
    const hash = await bcrypt.hash('admin123', 10);
    db.data.users.push({ id: nanoid(), username: 'admin', password: hash, role: 'admin' });
    await db.write();
  }
}
initDb();

// ✅ Auth middleware
function auth(requiredRoles = []) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing authorization header' });
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      if (requiredRoles.length && !requiredRoles.includes(payload.role))
        return res.status(403).json({ message: 'Forbidden' });
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

// ✅ Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// ✅ Users (admin only)
app.get('/api/users', auth(['admin']), async (req, res) => {
  await db.read();
  res.json(db.data.users.map(u => ({ id: u.id, username: u.username, role: u.role })));
});

// ✅ Patients CRUD
app.post('/api/patients', auth(['admin', 'reception', 'doctor']), async (req, res) => {
  await db.read();
  const p = { id: nanoid(), ...req.body, createdAt: Date.now() };
  db.data.patients.push(p);
  await db.write();
  res.json(p);
});
app.get('/api/patients', auth(['admin', 'reception', 'doctor']), async (req, res) => {
  await db.read();
  res.json(db.data.patients);
});
app.get('/api/patients/:id', auth(['admin', 'reception', 'doctor']), async (req, res) => {
  await db.read();
  const p = db.data.patients.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// ✅ Doctors CRUD
app.post('/api/doctors', auth(['admin']), async (req, res) => {
  await db.read();
  const d = { id: nanoid(), ...req.body, createdAt: Date.now() };
  db.data.doctors.push(d);
  await db.write();
  res.json(d);
});
app.get('/api/doctors', auth(['admin', 'reception', 'doctor']), async (req, res) => {
  await db.read();
  res.json(db.data.doctors);
});
app.get('/api/doctors/:id', auth(['admin', 'reception', 'doctor']), async (req, res) => {
  await db.read();
  const d = db.data.doctors.find(x => x.id === req.params.id);
  if (!d) return res.status(404).json({ message: 'Not found' });
  res.json(d);
});

// ✅ Appointments CRUD
app.post('/api/appointments', auth(['admin', 'reception', 'patient']), async (req, res) => {
  await db.read();
  const a = { id: nanoid(), status: 'booked', ...req.body, createdAt: Date.now() };
  const conflict = db.data.appointments.find(ap => ap.doctorId === a.doctorId && ap.time === a.time && ap.status === 'booked');
  if (conflict) return res.status(400).json({ message: 'Time slot already booked for this doctor' });
  db.data.appointments.push(a);
  await db.write();
  res.json(a);
});
app.get('/api/appointments', auth(['admin', 'reception', 'doctor', 'patient']), async (req, res) => {
  await db.read();
  if (req.user.role === 'patient') {
    const list = db.data.appointments.filter(a => a.patientId === req.user.id);
    return res.json(list);
  }
  res.json(db.data.appointments);
});
app.put('/api/appointments/:id', auth(['admin', 'reception', 'doctor']), async (req, res) => {
  await db.read();
  const idx = db.data.appointments.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  db.data.appointments[idx] = { ...db.data.appointments[idx], ...req.body };
  await db.write();
  res.json(db.data.appointments[idx]);
});
app.delete('/api/appointments/:id', auth(['admin', 'reception']), async (req, res) => {
  await db.read();
  db.data.appointments = db.data.appointments.filter(x => x.id !== req.params.id);
  await db.write();
  res.json({ message: 'Deleted' });
});

// ✅ Health check
app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

// ✅ Serve simple README
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'README_API.html'));
});

// ✅ Create README_API.html (if not exists)
const readmeHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>Health Appointment Backend</title></head>
<body>
<h1>Health Appointment Backend</h1>
<p>API endpoints are under <code>/api/*</code>. See README.md in project for details.</p>
</body></html>`;
fs.writeFileSync(path.join(__dirname, 'README_API.html'), readmeHtml);

// ✅ Ensure DB file exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], patients: [], doctors: [], appointments: [] }, null, 2));
}

// ✅ Start server
app.listen(PORT, () => console.log('✅ Backend running on port', PORT));
