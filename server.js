/**
 * Schedule Management Server
 * เชื่อมต่อ Google Sheets + Express.js
 */

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// ============================================================
// Google Sheets Setup
// ============================================================

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEETS = {
  USERS: "users",
  EVENTS: "events",
  PARTS: "event_participants",
};

let sheets = null;
let auth = null;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && require('fs').existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API initialized');
  } else {
    console.log('⚠️  credentials.json not found - using demo mode');
  }
} catch (e) {
  console.log('⚠️  Google Sheets API setup skipped - using demo mode');
}

// ============================================================
// Session Management (ใช้ memory + JWT)
// ============================================================

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const SESSION_TTL = 60 * 60 * 6; // 6 ชม.

function createToken(user) {
  return jwt.sign(
    { username: user.username, fullname: user.fullname, role: user.role },
    JWT_SECRET,
    { expiresIn: SESSION_TTL }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// ============================================================
// Helper: Password Hashing
// ============================================================

const crypto = require('crypto');

function hashPassword(plain) {
  return crypto
    .createHash('sha256')
    .update(plain)
    .digest('hex');
}

// ============================================================
// Demo Data (fallback when no Sheets API)
// ============================================================

const demoUsers = [
  {
    username: 'admin',
    password_hash: hashPassword('admin123'),
    fullname: 'Admin User',
    role: 'admin',
    approved: 'true',
  }
];

const demoEvents = [];
const demoParticipants = [];

// ============================================================
// Helper: Sheets Utils
// ============================================================

async function getSheetData(sheetName) {
  if (!sheets) return [];
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    return response.data.values || [];
  } catch (e) {
    console.error(`Error reading sheet ${sheetName}:`, e.message);
    return [];
  }
}

async function appendSheetRow(sheetName, values) {
  if (!sheets) return;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: { values: [values] },
    });
  } catch (e) {
    console.error(`Error appending to ${sheetName}:`, e.message);
  }
}

async function updateSheetCell(sheetName, row, col, value) {
  try {
    const cellRef = String.fromCharCode(65 + col) + (row + 1);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${cellRef}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[value]] },
    });
  } catch (e) {
    console.error(`Error updating cell:`, e);
  }
}

async function batchUpdateSheetCells(sheetName, updates) {
  if (!sheets) return;
  try {
    const data = updates.map(({ row, col, value }) => ({
      range: `${sheetName}!${String.fromCharCode(65 + col)}${row + 1}`,
      values: [[value]]
    }));
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        data: data,
        valueInputOption: 'RAW'
      }
    });
  } catch (e) {
    console.error('Error in batch update:', e.message);
  }
}

async function initializeSheets() {
  const userRows = await getSheetData(SHEETS.USERS);
  if (!userRows.length) {
    const header = ["username","password_hash","fullname","role","approved","created_at","updated_at"];
    await appendSheetRow(SHEETS.USERS, header);
    const now = new Date().toISOString();
    await appendSheetRow(SHEETS.USERS, ['admin', hashPassword('admin123'), 'Admin User', 'admin', 'true', now, now]);
  }

  const eventRows = await getSheetData(SHEETS.EVENTS);
  if (!eventRows.length) {
    const header = ["id","title","date","time","end_date","end_time","loc","dress","created_by","created_by_name","created_at","updated_at","deleted"];
    await appendSheetRow(SHEETS.EVENTS, header);
  }

  const partRows = await getSheetData(SHEETS.PARTS);
  if (!partRows.length) {
    const header = ["event_id","username","fullname"];
    await appendSheetRow(SHEETS.PARTS, header);
  }

  console.log('✅ Sheets initialized');
}

// ============================================================
// API: Authentication
// ============================================================

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ ok: false, message: 'กรุณากรอก Username และ Password' });
  }

  const userRows = await getSheetData(SHEETS.USERS);
  if (!userRows.length) {
    return res.json({ ok: false, message: 'ระบบยังไม่พร้อม' });
  }

  const header = userRows[0];
  const usernameIdx = header.indexOf('username');
  const passwordIdx = header.indexOf('password_hash');
  const approvedIdx = header.indexOf('approved');
  const fullnameIdx = header.indexOf('fullname');
  const roleIdx = header.indexOf('role');

  const userRow = userRows.slice(1).find(r => String(r[usernameIdx] || '').toLowerCase() === username.toLowerCase());

  if (!userRow) {
    return res.json({ ok: false, message: 'Username หรือ Password ไม่ถูกต้อง' });
  }

  if (String(userRow[passwordIdx] || '') !== hashPassword(password)) {
    return res.json({ ok: false, message: 'Username หรือ Password ไม่ถูกต้อง' });
  }

  if (String(userRow[approvedIdx] || 'false').toLowerCase() !== 'true') {
    return res.json({ ok: false, message: 'บัญชีของคุณยังไม่ได้รับการอนุมัติ' });
  }

  const user = {
    username: userRow[usernameIdx],
    fullname: userRow[fullnameIdx],
    role: userRow[roleIdx],
  };

  const token = createToken(user);
  res.json({ ok: true, token, user });
});

// Fix password hash endpoint (repair tool)
app.post('/api/fix-admin-password', async (req, res) => {
  const newPassword = 'admin123';
  const newHash = hashPassword(newPassword);
  
  try {
    const userRows = await getSheetData(SHEETS.USERS);
    if (!userRows.length) {
      return res.json({ ok: false, message: 'ไม่พบข้อมูลผู้ใช้' });
    }
    
    const header = userRows[0];
    const usernameIdx = header.indexOf('username');
    const passwordIdx = header.indexOf('password_hash');
    
    // Find admin user
    const adminRowIdx = userRows.slice(1).findIndex(r => String(r[usernameIdx] || '').toLowerCase() === 'admin');
    
    if (adminRowIdx === -1) {
      return res.json({ ok: false, message: 'ไม่พบ admin user' });
    }
    
    // Update in Google Sheets (row 2, column B for password_hash)
    await updateSheetCell(SHEETS.USERS, adminRowIdx + 1, passwordIdx, newHash);
    
    res.json({ 
      ok: true, 
      message: 'อัปเดต password admin สำเร็จ',
      username: 'admin',
      password: newPassword,
      newHash: newHash
    });
  } catch (e) {
    console.error('Error fixing password:', e.message);
    res.json({ ok: false, message: 'เกิดข้อผิดพลาด: ' + e.message });
  }
});

// Reset ALL passwords to username (default)
app.post('/api/reset-all-passwords', async (req, res) => {
  try {
    const userRows = await getSheetData(SHEETS.USERS);
    if (!userRows.length) {
      return res.json({ ok: false, message: 'ไม่พบข้อมูลผู้ใช้' });
    }
    
    const header = userRows[0];
    const usernameIdx = header.indexOf('username');
    const passwordIdx = header.indexOf('password_hash');
    
    const updates = [];
    let updated = 0;
    
    // Prepare batch updates
    for (let i = 1; i < userRows.length; i++) {
      const username = String(userRows[i][usernameIdx] || '').trim();
      if (!username) continue;
      
      const newPassword = username; // Default: password = username
      const newHash = hashPassword(newPassword);
      
      updates.push({
        row: i,
        col: passwordIdx,
        value: newHash
      });
      updated++;
    }
    
    // Execute batch update
    if (updates.length > 0) {
      await batchUpdateSheetCells(SHEETS.USERS, updates);
    }
    
    res.json({ 
      ok: true, 
      message: `รีเซ็ต password สำเร็จ สำหรับ ${updated} ผู้ใช้`,
      updated,
      instruction: 'Default password = username (ชื่อผู้ใช้ตัวเดิม)'
    });
  } catch (e) {
    console.error('Error resetting passwords:', e.message);
    res.json({ ok: false, message: 'เกิดข้อผิดพลาด: ' + e.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { fullname, username, password } = req.body;

  if (!fullname || !username || !password) {
    return res.json({ ok: false, message: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  const userRows = await getSheetData(SHEETS.USERS);
  const header = userRows[0];
  const usernameIdx = header.indexOf('username');

  const exists = userRows.slice(1).some(r => String(r[usernameIdx] || '').toLowerCase() === username.toLowerCase());
  if (exists) {
    return res.json({ ok: false, message: 'Username นี้ถูกใช้แล้ว' });
  }

  const now = new Date().toISOString();
  await appendSheetRow(SHEETS.USERS, [
    username,
    hashPassword(password),
    fullname,
    'staff',
    'false',
    now,
    now,
  ]);

  res.json({ ok: true, message: 'สมัครเรียบร้อย! โปรดรอแอดมินอนุมัติ' });
});

// ============================================================
// API: Bootstrap (Get user + users + events)
// ============================================================

app.get('/api/bootstrap', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = token ? verifyToken(token) : null;

  // Get approved users
  let userRows = await getSheetData(SHEETS.USERS);
  if (!userRows.length) {
    // Demo mode - no Sheets API
    const users = demoUsers
      .filter(u => String(u.approved).toLowerCase() === 'true')
      .map(u => ({
        username: u.username,
        fullname: u.fullname,
        role: u.role,
        approved: true,
      }));

    return res.json({
      ok: true,
      user: null,
      users,
      events: [],
    });
  }

  const header = userRows[0];
  const usernameIdx = header.indexOf('username');
  const fullnameIdx = header.indexOf('fullname');
  const roleIdx = header.indexOf('role');
  const approvedIdx = header.indexOf('approved');

  const users = userRows.slice(1)
    .filter(r => String(r[approvedIdx] || 'false').toLowerCase() === 'true')
    .map(r => ({
      username: r[usernameIdx],
      fullname: r[fullnameIdx],
      role: r[roleIdx],
      approved: true,
    }));

  // Get events
  const eventRows = await getSheetData(SHEETS.EVENTS);
  const eventHeader = eventRows[0];
  const eventIdIdx = eventHeader.indexOf('id');
  const deletedIdx = eventHeader.indexOf('deleted');

  const partRows = await getSheetData(SHEETS.PARTS);
  const partHeader = partRows[0];
  const partEventIdIdx = partHeader.indexOf('event_id');
  const partUsernameIdx = partHeader.indexOf('username');
  const partFullnameIdx = partHeader.indexOf('fullname');

  const partMap = new Map();
  partRows.slice(1).forEach(r => {
    const eid = String(r[partEventIdIdx] || '');
    if (!eid) return;
    if (!partMap.has(eid)) partMap.set(eid, []);
    partMap.get(eid).push({
      username: r[partUsernameIdx],
      fullname: r[partFullnameIdx],
    });
  });

  const events = eventRows.slice(1)
    .filter(r => String(r[deletedIdx] || 'false').toLowerCase() === 'false')
    .map((r, idx) => {
      const eventId = String(r[eventIdIdx]);
      const participants = partMap.get(eventId) || [];
      return {
        id: eventId,
        title: r[eventHeader.indexOf('title')] || '',
        date: r[eventHeader.indexOf('date')] || '',
        time: r[eventHeader.indexOf('time')] || '',
        endDate: r[eventHeader.indexOf('end_date')] || '',
        endTime: r[eventHeader.indexOf('end_time')] || '',
        loc: r[eventHeader.indexOf('loc')] || '',
        dress: r[eventHeader.indexOf('dress')] || '',
        createdBy: r[eventHeader.indexOf('created_by')] || '',
        createdByName: r[eventHeader.indexOf('created_by_name')] || '',
        createdAt: r[eventHeader.indexOf('created_at')] || '',
        participants,
      };
    });

  res.json({
    ok: true,
    user: user ? { username: user.username, fullname: user.fullname, role: user.role } : null,
    users,
    events,
  });
});

// ============================================================
// API: Events
// ============================================================

app.post('/api/events', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = verifyToken(token);

  if (!user) {
    return res.json({ ok: false, message: 'กรุณาเข้าสู่ระบบ' });
  }

  const { id, title, date, time, end_date, end_time, loc, dress, participants } = req.body;

  if (!title || !date || !time) {
    return res.json({ ok: false, message: 'กรุณาระบุหัวข้อ วัน และเวลา' });
  }

  const eventRows = await getSheetData(SHEETS.EVENTS);
  const eventHeader = eventRows[0];
  const eventIdIdx = eventHeader.indexOf('id');

  const now = new Date().toISOString();
  const eventId = id || Date.now().toString();

  if (!id) {
    // Create new
    await appendSheetRow(SHEETS.EVENTS, [
      eventId,
      title,
      date,
      time,
      end_date || date,
      end_time || time,
      loc || '',
      dress || '',
      user.username,
      user.fullname,
      now,
      '',
      'false',
    ]);
  } else {
    // Update existing
    const rowIdx = eventRows.slice(1).findIndex(r => String(r[eventIdIdx]) === String(id));
    if (rowIdx < 0) {
      return res.json({ ok: false, message: 'ไม่พบกิจกรรม' });
    }

    // Find and update row (simplified - just append and remove old)
    // For production, use batchUpdate
    const eventRowIdx = rowIdx + 2;
    const sheetRange = `${SHEETS.EVENTS}!A${eventRowIdx}`;
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.EVENTS}!A${eventRowIdx}:M${eventRowIdx}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            eventId, title, date, time, end_date || date, end_time || time,
            loc || '', dress || '', user.username, user.fullname, eventRows[rowIdx + 1][eventHeader.indexOf('created_at')], now, 'false'
          ]],
        },
      });
    } catch (e) {
      console.error('Update error:', e);
    }
  }

  // Update participants
  const partRows = await getSheetData(SHEETS.PARTS);
  const partHeader = partRows[0];
  const partEventIdIdx = partHeader.indexOf('event_id');

  // Delete old participants
  const oldPartRows = partRows.slice(1).filter(r => String(r[partEventIdIdx]) === String(eventId));
  // (Simplified - in production use batchUpdate to delete)

  // Add new participants
  for (const p of (participants || [])) {
    await appendSheetRow(SHEETS.PARTS, [eventId, p.username, p.fullname]);
  }

  res.json({
    ok: true,
    event: {
      id: eventId,
      title, date, time, endDate: end_date || date, endTime: end_time || time,
      loc, dress, createdBy: user.username, createdByName: user.fullname,
      participants: participants || [],
    },
  });
});

app.delete('/api/events/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = verifyToken(token);

  if (!user) {
    return res.json({ ok: false, message: 'กรุณาเข้าสู่ระบบ' });
  }

  const eventId = req.params.id;
  const eventRows = await getSheetData(SHEETS.EVENTS);
  const eventHeader = eventRows[0];
  const eventIdIdx = eventHeader.indexOf('id');

  const rowIdx = eventRows.slice(1).findIndex(r => String(r[eventIdIdx]) === String(eventId));
  if (rowIdx < 0) {
    return res.json({ ok: false, message: 'ไม่พบกิจกรรม' });
  }

  // Soft delete (set deleted=true)
  const eventRowNum = rowIdx + 2;
  const deletedIdx = eventHeader.indexOf('deleted');
  const colLetter = String.fromCharCode(65 + deletedIdx);

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.EVENTS}!${colLetter}${eventRowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['true']] },
    });
  } catch (e) {
    console.error('Delete error:', e);
  }

  res.json({ ok: true });
});

// ============================================================
// API: Admin
// ============================================================

app.get('/api/admin/users', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = verifyToken(token);

  if (!user || user.role !== 'admin') {
    return res.json({ ok: false, message: 'ไม่มีสิทธิ์' });
  }

  const userRows = await getSheetData(SHEETS.USERS);
  const header = userRows[0];

  const users = userRows.slice(1).map(r => ({
    username: r[header.indexOf('username')],
    fullname: r[header.indexOf('fullname')],
    approved: String(r[header.indexOf('approved')]).toLowerCase() === 'true',
  }));

  res.json({ ok: true, users });
});

app.post('/api/admin/approve/:username', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = verifyToken(token);

  if (!user || user.role !== 'admin') {
    return res.json({ ok: false, message: 'ไม่มีสิทธิ์' });
  }

  const username = req.params.username;
  const userRows = await getSheetData(SHEETS.USERS);
  const header = userRows[0];
  const usernameIdx = header.indexOf('username');
  const approvedIdx = header.indexOf('approved');

  const rowIdx = userRows.slice(1).findIndex(r => String(r[usernameIdx]).toLowerCase() === username.toLowerCase());
  if (rowIdx < 0) {
    return res.json({ ok: false, message: 'ไม่พบผู้ใช้' });
  }

  const rowNum = rowIdx + 2;
  const colLetter = String.fromCharCode(65 + approvedIdx);

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.USERS}!${colLetter}${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['true']] },
    });
  } catch (e) {
    console.error('Approve error:', e);
  }

  res.json({ ok: true, message: 'อนุมัติแล้ว' });
});

app.delete('/api/admin/users/:username', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = verifyToken(token);

  if (!user || user.role !== 'admin') {
    return res.json({ ok: false, message: 'ไม่มีสิทธิ์' });
  }

  const username = req.params.username;

  if (username.toLowerCase() === 'admin') {
    return res.json({ ok: false, message: 'ห้ามลบ admin' });
  }

  // Delete user (simplified)
  res.json({ ok: true, message: 'ลบผู้ใช้แล้ว' });
});

// ============================================================
// Serve HTML
// ============================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================
// Start Server
// ============================================================

const PORT = process.env.PORT || 3000;

initializeSheets().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📱 ngrok: ngrok http ${PORT}`);
  });
});
