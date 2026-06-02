/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  mockDepartments, 
  mockStudents, 
  mockPayments, 
  mockLetters, 
  mockMessages, 
  COLLEGE_IPS 
} from './src/data/mockData.js';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'server_data.json');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Server State Interface
interface ServerState {
  departments: any[];
  students: any[];
  payments: any[];
  letters: any[];
  messages: any[];
  collegeIps: Record<string, string>;
  auditLogs: any[];
}

function loadState(): ServerState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading server data:", error);
  }

  // Fallback to default mock data
  return {
    departments: mockDepartments,
    students: mockStudents,
    payments: mockPayments,
    letters: mockLetters,
    messages: mockMessages,
    collegeIps: COLLEGE_IPS,
    auditLogs: [
      {
        id: 'log-1',
        action: 'system_init',
        title: 'تفعيل المراقبة الأمنية',
        details: 'تم تفعيل بروتوكول الرقابة والتحقق من جدار الحماية للجامعة والخدمة الرقمية.',
        user: 'مدير النظام الأول',
        timestamp: '2026-05-27 08:30:00',
        ip: '192.168.1.1'
      }
    ]
  };
}

function saveState(state: ServerState) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error saving server data:", error);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// GET all data
app.get('/api/data', (req, res) => {
  const currentState = loadState();
  res.json(currentState);
});

// POST to save modified collections
app.post('/api/save', (req, res) => {
  const currentState = loadState();
  const { departments, students, payments, letters, messages, collegeIps, auditLogs } = req.body;

  if (departments !== undefined) currentState.departments = departments;
  if (students !== undefined) currentState.students = students;
  if (payments !== undefined) currentState.payments = payments;
  if (letters !== undefined) currentState.letters = letters;
  if (messages !== undefined) currentState.messages = messages;
  if (collegeIps !== undefined) currentState.collegeIps = collegeIps;
  if (auditLogs !== undefined) currentState.auditLogs = auditLogs;

  saveState(currentState);
  res.json({ status: 'ok' });
});

// POST to reset database to default
app.post('/api/reset', (req, res) => {
  const defaultState: ServerState = {
    departments: mockDepartments,
    students: mockStudents,
    payments: mockPayments,
    letters: mockLetters,
    messages: mockMessages,
    collegeIps: COLLEGE_IPS,
    auditLogs: [
      {
        id: 'log-1',
        action: 'system_init',
        title: 'تفعيل المراقبة الأمنية',
        details: 'تم تفعيل بروتوكول الرقابة والتحقق من جدار الحماية للجامعة والخدمة الرقمية.',
        user: 'مدير النظام الأول',
        timestamp: '2026-05-27 08:30:00',
        ip: '192.168.1.1'
      }
    ]
  };
  saveState(defaultState);
  res.json({ status: 'ok' });
});

// ----------------------------------------------------
// VITE OR STATIC MIDDLEWARE
// ----------------------------------------------------
async function initializeVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(
          path.resolve(process.cwd(), 'index.html'),
          'utf-8'
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running as full-stack app on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  initializeVite().catch((err) => {
    console.error("Failed to initialize server:", err);
  });
}

export default app;
