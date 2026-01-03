import React, { useState, useEffect, useRef, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Send,
  ChevronDown,
  Timer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  Volume2,
  Settings,
  Maximize2,
  MessageSquare,
  Code as CodeIcon,
  FileText,
  HelpCircle,
  Flag
} from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string[];
}

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual?: string;
  runtime?: number;
}

interface Message {
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface InterviewArenaProps {
  sessionId: string;
  problem: Problem;
  onEnd: (results: any) => void;
}

const InterviewArena: React.FC<InterviewArenaProps> = ({
  sessionId,
  problem,
  onEnd
}) => {
  // State
  const [code, setCode] = useState(getStarterCode(problem.id));
  const [language, setLanguage] = useState('javascript');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'solution' | 'hints'>('description');
  const [outputTab, setOutputTab] = useState<'testcases' | 'output' | 'chat'>('chat');
  
  // Media state
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  
  // Proctoring
  const [tabSwitches, setTabSwitches] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);
  
  // Tab switch detection (proctoring)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setWarnings(w => [...w, 'Multiple tab switches detected. This may be flagged.']);
          }
          // Report to backend
          sendProctoringEvent('tab_switch', { count: newCount });
          return newCount;
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Copy/paste detection
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text') || '';
      if (pastedText.length > 50) {
        sendProctoringEvent('copy_paste', { length: pastedText.length });
      }
    };
    
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);
  
  // Initialize WebSocket
  useEffect(() => {
    connectWebSocket();
    return () => {
      wsRef.current?.close();
    };
  }, [sessionId]);
  
  // Setup video
  useEffect(() => {
    if (isVideoOn) {
      startVideo();
    } else {
      stopVideo();
    }
  }, [isVideoOn]);
  
  // Setup speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        if (event.results[event.results.length - 1].isFinal) {
          handleVoiceInput(transcript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);
  
  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const connectWebSocket = () => {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/interview/${sessionId}`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      // Request initial AI greeting
      sendMessage({ type: 'start' });
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
      // Attempt reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
  };
  
  const sendMessage = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };
  
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'ai_response':
        setMessages(prev => [...prev, {
          role: 'ai',
          content: data.text,
          timestamp: new Date()
        }]);
        
        // Text-to-speech
        if (isMicOn) {
          speakText(data.text);
        }
        break;
        
      case 'code_analysis':
        setTestResults(data.results.test_results?.details || []);
        setIsRunning(false);
        break;
        
      case 'session_ended':
        onEnd(data.results);
        break;
    }
  };
  
  const sendProctoringEvent = (eventType: string, data: any) => {
    sendMessage({
      type: 'proctoring',
      event_type: eventType,
      data
    });
  };
  
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsVideoOn(false);
    }
  };
  
  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };
  
  const toggleMic = () => {
    if (isMicOn) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
    setIsMicOn(!isMicOn);
  };
  
  const handleVoiceInput = (transcript: string) => {
    if (!transcript.trim()) return;
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: transcript,
      timestamp: new Date()
    }]);
    
    sendMessage({
      type: 'transcript',
      text: transcript
    });
  };
  
  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: inputText,
      timestamp: new Date()
    }]);
    
    sendMessage({
      type: 'transcript',
      text: inputText
    });
    
    setInputText('');
  };
  
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };
  
  const runCode = async () => {
    setIsRunning(true);
    setOutputTab('testcases');
    
    sendMessage({
      type: 'code_update',
      code,
      language
    });
  };
  
  const submitSolution = async () => {
    setIsRunning(true);
    
    // Run final analysis
    sendMessage({
      type: 'code_update',
      code,
      language
    });
    
    // Add message about submission
    setMessages(prev => [...prev, {
      role: 'user',
      content: "I'd like to submit my solution.",
      timestamp: new Date()
    }]);
    
    sendMessage({
      type: 'transcript',
      text: "I've finished coding and would like to submit my solution for review."
    });
  };
  
  const endInterview = () => {
    sendMessage({ type: 'end' });
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'Hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{problem.title}</h1>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 text-gray-300">
            <Timer className="w-4 h-4" />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
          
          {/* Warnings */}
          {tabSwitches > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">{tabSwitches} tab switch{tabSwitches > 1 ? 'es' : ''}</span>
            </div>
          )}
          
          {/* Media Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMic}
              className={`p-2 rounded-lg transition-colors ${
                isMicOn ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2 rounded-lg transition-colors ${
                isVideoOn ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>
          
          {/* End Interview */}
          <button
            onClick={endInterview}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            End Interview
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-[420px] flex flex-col border-r border-gray-700">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {(['description', 'solution', 'hints'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{problem.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Examples</h3>
                  {problem.examples.map((example, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-4 mb-3">
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">Input:</span>
                        <code className="block mt-1 text-sm text-blue-300">{example.input}</code>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">Output:</span>
                        <code className="block mt-1 text-sm text-green-300">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="text-xs text-gray-400">Explanation:</span>
                          <p className="mt-1 text-sm text-gray-300">{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {problem.constraints && problem.constraints.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Constraints</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {problem.constraints.map((constraint, idx) => (
                        <li key={idx} className="text-sm text-gray-400">
                          <code>{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'hints' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Ask the AI interviewer for hints during your discussion!
                </p>
                <button
                  onClick={() => {
                    handleVoiceInput("Can you give me a hint?");
                  }}
                  className="w-full py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Request Hint
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </button>
              <button
                onClick={submitSolution}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
          
          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeMirror
              value={code}
              height="100%"
              theme={oneDark}
              extensions={[javascript()]}
              onChange={(value) => setCode(value)}
              className="h-full"
            />
          </div>
          
          {/* Output Panel */}
          <div className="h-48 border-t border-gray-700">
            {/* Output Tabs */}
            <div className="flex border-b border-gray-700 bg-gray-800">
              {(['testcases', 'output', 'chat'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setOutputTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    outputTab === tab
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab === 'testcases' && <CheckCircle className="w-4 h-4" />}
                  {tab === 'output' && <CodeIcon className="w-4 h-4" />}
                  {tab === 'chat' && <MessageSquare className="w-4 h-4" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Output Content */}
            <div className="h-[calc(100%-41px)] overflow-y-auto p-4 bg-gray-900">
              {outputTab === 'testcases' && (
                <div className="space-y-2">
                  {testResults.length === 0 ? (
                    <p className="text-gray-500 text-sm">Run your code to see test results</p>
                  ) : (
                    testResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          result.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {result.passed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-sm font-medium">
                            Test Case {idx + 1}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>Input: <code className="text-blue-300">{result.input}</code></div>
                          <div>Expected: <code className="text-green-300">{result.expected}</code></div>
                          {result.actual && (
                            <div>Actual: <code className={result.passed ? 'text-green-300' : 'text-red-300'}>{result.actual}</code></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {outputTab === 'chat' && (
                <div className="h-full flex flex-col">
                  <p className="text-xs text-gray-500 mb-2">Chat with AI (or use voice)</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleTextSubmit}
                      className="p-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Panel - AI & Video */}
        <div className="w-80 flex flex-col border-l border-gray-700">
          {/* Video Feed */}
          <div className="h-48 bg-gray-800 relative">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Camera off</p>
                </div>
              </div>
            )}
            
            {/* AI Avatar overlay */}
            <div className="absolute bottom-2 right-2 w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
              <div className={`w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
                <Volume2 className={`w-6 h-6 ${isSpeaking ? 'text-white' : 'text-purple-300'}`} />
              </div>
            </div>
            
            {/* Listening indicator */}
            {isListening && (
              <div className="absolute top-2 left-2 flex items-center gap-2 bg-green-500/80 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs text-white">Listening...</span>
              </div>
            )}
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-50">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isSpeaking && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400">AI is speaking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Voice Input Area */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Type or speak..."
                className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={handleTextSubmit}
                disabled={!inputText.trim()}
                className="p-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-3 flex items-center justify-center">
              <button
                onClick={toggleMic}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMicOn
                    ? 'bg-green-500 hover:bg-green-400 scale-110'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isMicOn ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              {isMicOn ? 'Click to mute' : 'Click to speak with AI'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get starter code
function getStarterCode(problemId: string): string {
  // In production, fetch from backend based on problem
  return `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your solution here
    
}`;
}

export default InterviewArena;
