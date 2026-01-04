import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import Webcam from 'react-webcam'
import Confetti from 'react-confetti'
import { 
  Play, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Send,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const mockProblem = {
  title: 'Two Sum',
  difficulty: 'Easy',
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
    },
  ],
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9',
    'Only one valid answer exists.',
  ],
}

const starterCode = `def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    pass
`

export default function InterviewRoom() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id } = useParams()
  const [code, setCode] = useState(starterCode)
  const [language, setLanguage] = useState('python')
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [showProctor] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[]>([])
  const [chatMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your AI interviewer today. Let\'s start with the Two Sum problem. Can you explain your approach before coding?' },
  ])
  const [isRunning, setIsRunning] = useState(false)

  const handleRunCode = () => {
    setIsRunning(true)
    // Simulate test results
    setTimeout(() => {
      setTestResults([
        { passed: true, message: 'Test case 1 passed: nums = [2,7,11,15], target = 9' },
        { passed: true, message: 'Test case 2 passed: nums = [3,2,4], target = 6' },
        { passed: false, message: 'Test case 3 failed: Expected [0,1], got [1,0]' },
      ])
      setIsRunning(false)
    }, 1500)
  }

  const handleSubmit = () => {
    setIsRunning(true)
    setTimeout(() => {
      setTestResults([
        { passed: true, message: 'All test cases passed!' },
      ])
      setShowConfetti(true)
      setIsRunning(false)
      setTimeout(() => setShowConfetti(false), 5000)
    }, 2000)
  }

  return (
    <div className="h-screen bg-[#0f0f23] flex flex-col overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Header */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-white">{mockProblem.title}</h1>
          <Badge className={mockProblem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : ''}>
            {mockProblem.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMicOn(!isMicOn)}
            className={!isMicOn ? 'text-red-500' : ''}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCamOn(!isCamOn)}
            className={!isCamOn ? 'text-red-500' : ''}
          >
            {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button variant="destructive" size="sm">
            End Interview
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Panel */}
        <div className="w-[400px] border-r border-gray-800 flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Problem</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{mockProblem.description}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">Examples</h3>
              {mockProblem.examples.map((example, i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-3 mb-2">
                  <p className="text-sm text-gray-400">Input: <code className="text-indigo-300">{example.input}</code></p>
                  <p className="text-sm text-gray-400">Output: <code className="text-green-300">{example.output}</code></p>
                  {example.explanation && (
                    <p className="text-sm text-gray-500 mt-1">{example.explanation}</p>
                  )}
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Constraints</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                {mockProblem.constraints.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Chat */}
          <div className="h-64 border-t border-gray-800 flex flex-col">
            <div className="p-2 bg-gray-800/50 text-sm text-gray-400">AI Interviewer</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'max-w-[90%] p-3 rounded-lg text-sm',
                    msg.role === 'ai'
                      ? 'bg-indigo-500/20 text-gray-200'
                      : 'bg-gray-700 text-gray-200 ml-auto'
                  )}
                >
                  {msg.content}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-700"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="h-32 border-t border-gray-800 overflow-y-auto p-3 bg-gray-900/50">
              {testResults.map((result, i) => (
                <div key={i} className="flex items-center gap-2 text-sm mb-1">
                  {result.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                    {result.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="h-14 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4">
            <Button variant="outline" onClick={handleRunCode} disabled={isRunning}>
              <Play className="h-4 w-4 mr-2" />
              Run Code
            </Button>
            <Button onClick={handleSubmit} disabled={isRunning}>
              Submit Solution
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Webcam Preview */}
        <div className="absolute bottom-20 right-4 w-48 aspect-video rounded-lg overflow-hidden border-2 border-gray-700 shadow-xl">
          {isCamOn ? (
            <Webcam
              audio={false}
              className="w-full h-full object-cover"
              mirrored
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-gray-500" />
            </div>
          )}
        </div>

        {/* Proctor Alert */}
        {showProctor && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg flex items-center gap-3 shadow-xl">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Face not detected! Please stay in frame.</span>
          </div>
        )}
      </div>
    </div>
  )
}
