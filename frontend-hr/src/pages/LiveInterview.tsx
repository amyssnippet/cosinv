import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  Phone,
  Send,
  Code,
  FileText,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const mockCandidate = {
  id: '1',
  name: 'Alex Chen',
  role: 'Senior Frontend Developer',
  avatar: null,
}

const mockMessages = [
  { id: '1', sender: 'system', text: 'Interview started', time: '10:00 AM' },
  { id: '2', sender: 'hr', text: 'Welcome Alex! Let\'s start with a brief introduction.', time: '10:01 AM' },
  { id: '3', sender: 'candidate', text: 'Thank you! I\'m excited to be here.', time: '10:02 AM' },
  { id: '4', sender: 'hr', text: 'Great! Can you tell me about your experience with React?', time: '10:03 AM' },
]

export default function LiveInterview() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id } = useParams()
  const navigate = useNavigate()
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [showParticipants, setShowParticipants] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(mockMessages)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const sendMessage = () => {
    if (!message.trim()) return
    setMessages([...messages, {
      id: String(messages.length + 1),
      sender: 'hr',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
    setMessage('')
  }

  const endCall = () => {
    if (confirm('Are you sure you want to end the interview?')) {
      navigate('/candidates')
    }
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              C
            </div>
            <div>
              <h1 className="text-white font-medium">Live Interview</h1>
              <p className="text-xs text-slate-400">{mockCandidate.name} • {mockCandidate.role}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-mono">{formatTime(elapsedTime)}</span>
          </div>
          <Badge variant="outline" className="border-green-500 text-green-400">
            Recording
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Main Video */}
          <div className="flex-1 bg-slate-800 rounded-xl relative overflow-hidden">
            {/* Candidate Video (large) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={mockCandidate.avatar || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-4xl">
                    {mockCandidate.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white text-lg font-medium">{mockCandidate.name}</p>
                <p className="text-slate-400 text-sm">Candidate</p>
              </div>
            </div>

            {/* Self Video (small) */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-600">
              <div className="absolute inset-0 flex items-center justify-center">
                {isVideoOn ? (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-600 flex items-center justify-center mb-1">
                      <span className="text-white font-medium">You</span>
                    </div>
                  </div>
                ) : (
                  <VideoOff className="h-8 w-8 text-slate-500" />
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1">
                <Badge variant="outline" className="bg-slate-900/50 border-slate-600 text-xs">
                  {isMicOn ? 'Mic On' : 'Muted'}
                </Badge>
              </div>
            </div>

            {/* Candidate info overlay */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-slate-900/50 text-white border-slate-600">
                <Clock className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="h-20 bg-slate-800 rounded-xl flex items-center justify-center gap-4 px-6">
            <Button
              variant={isMicOn ? 'outline' : 'destructive'}
              size="lg"
              className={isMicOn ? 'border-slate-600 text-white hover:bg-slate-700' : ''}
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button
              variant={isVideoOn ? 'outline' : 'destructive'}
              size="lg"
              className={isVideoOn ? 'border-slate-600 text-white hover:bg-slate-700' : ''}
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Button
              variant={isScreenSharing ? 'default' : 'outline'}
              size="lg"
              className={isScreenSharing ? 'bg-blue-600' : 'border-slate-600 text-white hover:bg-slate-700'}
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            >
              <Monitor className="h-5 w-5" />
            </Button>
            
            <div className="w-px h-8 bg-slate-700" />
            
            <Button
              variant={showChat ? 'default' : 'outline'}
              size="lg"
              className={showChat ? 'bg-blue-600' : 'border-slate-600 text-white hover:bg-slate-700'}
              onClick={() => { setShowChat(!showChat); setShowParticipants(false) }}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button
              variant={showParticipants ? 'default' : 'outline'}
              size="lg"
              className={showParticipants ? 'bg-blue-600' : 'border-slate-600 text-white hover:bg-slate-700'}
              onClick={() => { setShowParticipants(!showParticipants); setShowChat(false) }}
            >
              <Users className="h-5 w-5" />
            </Button>
            
            <div className="w-px h-8 bg-slate-700" />
            
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
            >
              <Phone className="h-5 w-5 rotate-135" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        {(showChat || showParticipants) && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
            {showChat && (
              <>
                <div className="p-4 border-b border-slate-700">
                  <h2 className="text-white font-medium">Chat</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`${msg.sender === 'hr' ? 'text-right' : ''}`}>
                      {msg.sender === 'system' ? (
                        <div className="text-center">
                          <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                            {msg.text}
                          </span>
                        </div>
                      ) : (
                        <div className={`inline-block max-w-[80%] ${
                          msg.sender === 'hr' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                        } rounded-lg px-3 py-2`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-60 mt-1">{msg.time}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <Button size="icon" onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {showParticipants && (
              <>
                <div className="p-4 border-b border-slate-700">
                  <h2 className="text-white font-medium">Participants (2)</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-600 text-white">AC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white text-sm font-medium">{mockCandidate.name}</p>
                        <p className="text-slate-400 text-xs">Candidate</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mic className="h-4 w-4 text-green-400" />
                      <Video className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-600 text-white">You</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white text-sm font-medium">You (Host)</p>
                        <p className="text-slate-400 text-xs">Interviewer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isMicOn ? <Mic className="h-4 w-4 text-green-400" /> : <MicOff className="h-4 w-4 text-red-400" />}
                      {isVideoOn ? <Video className="h-4 w-4 text-green-400" /> : <VideoOff className="h-4 w-4 text-red-400" />}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-t border-slate-700 space-y-2">
                  <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                    <Code className="h-4 w-4 mr-2" />
                    Share Code Editor
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                    <FileText className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
