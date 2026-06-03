const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_TMP_DIR = process.env.GEMINI_TMP_DIR || path.join(require('os').homedir(), '.gemini/tmp');

app.use(cors());
app.use(express.json());

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    if (!(await fs.pathExists(GEMINI_TMP_DIR))) {
      return res.json([]);
    }
    const entries = await fs.readdir(GEMINI_TMP_DIR);
    const projects = [];

    for (const entry of entries) {
      const projectPath = path.join(GEMINI_TMP_DIR, entry);
      const stat = await fs.stat(projectPath);
      if (stat.isDirectory()) {
        projects.push({
          id: entry,
          path: projectPath
        });
      }
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sessions for a project
app.get('/api/projects/:projectId/sessions', async (req, res) => {
  const { projectId } = req.params;
  const chatsPath = path.join(GEMINI_TMP_DIR, projectId, 'chats');

  try {
    if (!(await fs.pathExists(chatsPath))) {
      return res.json([]);
    }
    const files = await fs.readdir(chatsPath);
    const sessions = files
      .filter(f => (f.startsWith('session-') && (f.endsWith('.json') || f.endsWith('.jsonl'))))
      .map(f => ({
        id: f,
        name: f.replace('session-', '').replace('.jsonl', '').replace('.json', '')
      }))
      .sort((a, b) => b.id.localeCompare(a.id));
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session details
app.get('/api/projects/:projectId/sessions/:sessionId', async (req, res) => {
  const { projectId, sessionId } = req.params;
  const sessionPath = path.join(GEMINI_TMP_DIR, projectId, 'chats', sessionId);

  try {
    if (!(await fs.pathExists(sessionPath))) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const content = await fs.readFile(sessionPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const history = [];
    let currentTurn = { turns: [] };
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'user') {
          const userContent = Array.isArray(data.content) 
            ? data.content.map(c => c.text).join('\n')
            : data.content;
            
          history.push({
            type: 'user',
            content: userContent,
            timestamp: data.timestamp
          });
        } else if (data.type === 'gemini') {
          history.push({
            type: 'gemini',
            content: data.content,
            thoughts: data.thoughts,
            toolCalls: data.toolCalls,
            model: data.model,
            timestamp: data.timestamp
          });
        }
      } catch (e) {
        console.error('Error parsing line:', line, e);
      }
    }
    
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Watching Gemini history in: ${GEMINI_TMP_DIR}`);
});
