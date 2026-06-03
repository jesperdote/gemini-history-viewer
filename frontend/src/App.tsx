import React, { useState, useEffect } from 'react';
import { Layout, MessageSquare, Box, ChevronRight, Hash, Clock, Terminal, User, Bot, BrainCircuit, Code } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Project {
  id: string;
  path: string;
}

interface Session {
  id: string;
  name: string;
}

interface Turn {
  role: 'user' | 'model';
  content: string;
  thoughts?: string;
  toolCalls?: any[];
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then(res => res.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetch(`${API_URL}/api/projects/${selectedProject}/sessions`)
        .then(res => res.json())
        .then(setSessions)
        .catch(console.error);
    } else {
      setSessions([]);
    }
    setSelectedSession(null);
    setHistory(null);
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedSession) {
      setLoading(true);
      fetch(`${API_URL}/api/projects/${selectedProject}/sessions/${selectedSession}`)
        .then(res => res.json())
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedProject, selectedSession]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar - Projects */}
      <div className="w-64 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <Box className="text-blue-400" size={20} />
          <h1 className="font-bold text-lg tracking-tight">Gemini History</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <h2 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</h2>
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors mb-1 ${
                selectedProject === project.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Hash size={14} />
              <span className="truncate text-left flex-1">{project.id}</span>
              {selectedProject === project.id && <ChevronRight size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar - Sessions */}
      <div className="w-72 border-r border-slate-800 flex flex-col bg-slate-900/30">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold flex items-center gap-2 text-slate-300">
            <Clock size={18} className="text-purple-400" />
            Sessions
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {!selectedProject && (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 text-sm p-4 text-center">
              Select a project to see sessions
            </div>
          )}
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session.id)}
              className={`w-full flex flex-col gap-1 px-3 py-2 rounded-md text-sm transition-colors mb-1 ${
                selectedSession === session.id ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <span className="truncate text-left font-medium w-full">{session.name}</span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock size={10} />
                {session.id}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {!selectedSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
            <Layout size={48} className="mb-4 opacity-20" />
            <p>Select a session to view conversation history</p>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <header className="mb-10 pb-6 border-b border-slate-800">
              <h1 className="text-2xl font-bold text-white mb-2">{selectedSession.replace('session-', '').replace('.json', '')}</h1>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Hash size={12} /> {selectedProject}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {selectedSession}</span>
              </div>
            </header>

            <div className="max-w-4xl mx-auto space-y-12">
              {history?.history?.map((turn: any, index: number) => (
                <div key={index} className="space-y-6">
                  {/* User Turn */}
                  {turn.type === 'user' && (
                    <div className="flex gap-4 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">User</span>
                          <span className="text-[10px] text-slate-600">{new Date(turn.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-[15px] bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                          {turn.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gemini Turn */}
                  {turn.type === 'gemini' && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                        <Bot size={18} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">Gemini</span>
                          <span className="text-[10px] text-slate-600">{new Date(turn.timestamp).toLocaleTimeString()}</span>
                          {turn.model && <span className="text-[10px] bg-blue-500/10 text-blue-400/70 px-1.5 py-0.5 rounded border border-blue-500/10 font-mono ml-2">{turn.model}</span>}
                        </div>
                        
                        {/* Thoughts */}
                        {turn.thoughts && turn.thoughts.length > 0 && (
                          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                            <div className="px-4 py-2 border-b border-slate-800 bg-slate-800/30 flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                              <BrainCircuit size={14} className="text-purple-400" />
                              Reasoning Summary
                            </div>
                            <div className="p-4 space-y-3">
                              {turn.thoughts.map((thought: any, tIdx: number) => (
                                <div key={tIdx} className="text-slate-400 italic text-sm leading-relaxed border-l-2 border-slate-700 pl-3">
                                  {thought.description}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tool Calls */}
                        {turn.toolCalls && turn.toolCalls.length > 0 && (
                          <div className="space-y-3">
                            {turn.toolCalls.map((tc: any, tcIdx: number) => (
                              <div key={tcIdx} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                                <div className="px-4 py-2 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Code size={14} className="text-emerald-400" />
                                    <span className="text-[12px] font-mono font-bold text-emerald-400">{tc.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">Tool Call</span>
                                </div>
                                <div className="p-3 bg-black/20">
                                  <pre className="text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(tc.args, null, 2)}
                                  </pre>
                                </div>
                                {tc.result && tc.result[0]?.functionResponse?.response && (
                                  <div className="border-t border-slate-800">
                                    <div className="px-4 py-1.5 bg-slate-800/20 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/50">Response</div>
                                    <div className="p-3">
                                      <pre className="text-xs text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                                        {typeof tc.result[0].functionResponse.response.output === 'string' 
                                          ? tc.result[0].functionResponse.response.output 
                                          : JSON.stringify(tc.result[0].functionResponse.response, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Response Text */}
                        {turn.content && (
                          <div className="text-slate-100 leading-relaxed whitespace-pre-wrap text-[15px]">
                            {turn.content}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
