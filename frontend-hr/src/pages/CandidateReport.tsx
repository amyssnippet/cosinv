import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { 
  ArrowLeft, 
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Code,
  Video,
  FileText,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const mockCandidate = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@email.com',
  phone: '+1 (555) 123-4567',
  role: 'Senior Frontend Developer',
  job: 'Frontend Team',
  status: 'passed',
  appliedAt: '2024-01-18',
  resumeUrl: '#',
  avatar: null,
  scores: {
    overall: 92,
    technical: 95,
    problemSolving: 90,
    communication: 88,
    codeQuality: 94,
    systemDesign: 89,
  },
  timeline: [
    { stage: 'Application Received', date: '2024-01-18', status: 'completed' },
    { stage: 'AI Screening', date: '2024-01-19', status: 'completed', score: 88 },
    { stage: 'Technical Interview', date: '2024-01-20', status: 'completed', score: 95 },
    { stage: 'System Design', date: '2024-01-21', status: 'completed', score: 89 },
    { stage: 'Final Review', date: '2024-01-22', status: 'current' },
  ],
  proctoring: {
    flags: 2,
    tabSwitches: 3,
    faceDetectionIssues: 0,
    suspiciousActivity: false,
  },
  interview: {
    duration: '58:42',
    questionsAnswered: 8,
    codeSubmissions: 4,
  },
}

// Radar data for future chart implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _radarData = [
  { skill: 'Technical', value: 95, fullMark: 100 },
  { skill: 'Problem Solving', value: 90, fullMark: 100 },
  { skill: 'Communication', value: 88, fullMark: 100 },
  { skill: 'Code Quality', value: 94, fullMark: 100 },
  { skill: 'System Design', value: 89, fullMark: 100 },
]

export default function CandidateReport() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id } = useParams()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const totalDuration = 3522 // 58:42 in seconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-4">
            <Link to="/candidates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mockCandidate.avatar || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-medium">
                {mockCandidate.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{mockCandidate.name}</h1>
              <p className="text-slate-500">{mockCandidate.role} • {mockCandidate.job}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-100 text-green-700 border-green-200">Passed</Badge>
                <span className="text-sm text-slate-400">Applied {mockCandidate.appliedAt}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Hire
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Score */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Score</span>
                <span className={`text-4xl font-bold ${getScoreColor(mockCandidate.scores.overall)}`}>
                  {mockCandidate.scores.overall}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(mockCandidate.scores).filter(([key]) => key !== 'overall').map(([key, value]) => (
                  <div key={key} className="text-center p-4 rounded-lg bg-slate-50">
                    <div className={`text-2xl font-bold ${getScoreColor(value)}`}>{value}%</div>
                    <div className="text-sm text-slate-500 capitalize mt-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getScoreBg(value)} transition-all`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interview Replay */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Interview Replay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video placeholder */}
              <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative">
                <div className="text-white text-center">
                  <Video className="h-16 w-16 mx-auto mb-2 opacity-50" />
                  <p className="text-slate-400">Interview Recording</p>
                </div>
              </div>

              {/* Timeline scrubber */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-10 w-10"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 10))}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0}
                      max={totalDuration}
                      value={currentTime}
                      onChange={(e) => setCurrentTime(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <span className="text-sm text-slate-500 font-mono">
                    {formatTime(currentTime)} / {mockCandidate.interview.duration}
                  </span>
                  <Button variant="ghost" size="icon">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>

                {/* Timeline markers */}
                <div className="relative h-8 bg-slate-100 rounded">
                  <div className="absolute left-[15%] top-0 h-full w-0.5 bg-blue-500" title="Question 1" />
                  <div className="absolute left-[30%] top-0 h-full w-0.5 bg-blue-500" title="Code submission" />
                  <div className="absolute left-[45%] top-0 h-full w-0.5 bg-amber-500" title="Tab switch" />
                  <div className="absolute left-[60%] top-0 h-full w-0.5 bg-blue-500" title="Question 2" />
                  <div className="absolute left-[75%] top-0 h-full w-0.5 bg-blue-500" title="Code submission" />
                  <div className="absolute left-[90%] top-0 h-full w-0.5 bg-green-500" title="Completed" />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Start</span>
                  <span>Technical Questions</span>
                  <span>Coding Challenge</span>
                  <span>End</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Submissions */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">Question {i}: Two Sum</h4>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700">Passed</Badge>
                      <span className="text-sm text-slate-500">4/4 tests</span>
                    </div>
                  </div>
                  <pre className="text-xs text-slate-600 bg-slate-900 text-slate-300 p-3 rounded overflow-x-auto">
{`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`}
                  </pre>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span>Runtime: 56ms</span>
                    <span>Memory: 42.8 MB</span>
                    <span>Complexity: O(n)</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-900">{mockCandidate.email}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-slate-500">Phone</span>
                <span className="text-slate-900">{mockCandidate.phone}</span>
              </div>
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Resume
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Interview Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {mockCandidate.timeline.map((item, index) => (
                  <div key={item.stage} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'current' ? 'bg-blue-500 ring-4 ring-blue-100' :
                        'bg-slate-300'
                      }`} />
                      {index < mockCandidate.timeline.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 ${
                          item.status === 'completed' ? 'bg-green-200' : 'bg-slate-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={`text-sm font-medium ${
                        item.status === 'current' ? 'text-blue-600' : 'text-slate-900'
                      }`}>
                        {item.stage}
                      </p>
                      <p className="text-xs text-slate-500">{item.date}</p>
                      {item.score && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Score: {item.score}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Proctoring Report */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Proctoring Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Flags</span>
                <Badge variant={mockCandidate.proctoring.flags > 0 ? 'outline' : 'secondary'} 
                  className={mockCandidate.proctoring.flags > 2 ? 'border-red-200 text-red-700' : ''}>
                  {mockCandidate.proctoring.flags}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tab Switches</span>
                <Badge variant="outline">{mockCandidate.proctoring.tabSwitches}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Face Detection Issues</span>
                <Badge variant="secondary">{mockCandidate.proctoring.faceDetectionIssues}</Badge>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                {mockCandidate.proctoring.suspiciousActivity ? (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Suspicious activity detected</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">No suspicious activity</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interview Stats */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Interview Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="text-slate-900 font-mono">{mockCandidate.interview.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Questions Answered</span>
                <span className="text-slate-900">{mockCandidate.interview.questionsAnswered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Code Submissions</span>
                <span className="text-slate-900">{mockCandidate.interview.codeSubmissions}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
