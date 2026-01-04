import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Lock, Play } from 'lucide-react'

const learningPaths = [
  {
    id: 'google-swe',
    title: 'Google Software Engineer',
    description: 'Prepare for Google L3-L5 interviews',
    progress: 45,
    modules: [
      { title: 'Arrays & Strings', status: 'completed', problems: 12 },
      { title: 'Linked Lists', status: 'completed', problems: 8 },
      { title: 'Trees & Graphs', status: 'in-progress', problems: 15 },
      { title: 'Dynamic Programming', status: 'locked', problems: 20 },
      { title: 'System Design', status: 'locked', problems: 10 },
    ],
  },
  {
    id: 'meta-frontend',
    title: 'Meta Frontend Engineer',
    description: 'Master frontend interviews at Meta',
    progress: 20,
    modules: [
      { title: 'JavaScript Fundamentals', status: 'completed', problems: 10 },
      { title: 'React Deep Dive', status: 'in-progress', problems: 15 },
      { title: 'State Management', status: 'locked', problems: 8 },
      { title: 'Performance Optimization', status: 'locked', problems: 12 },
    ],
  },
  {
    id: 'amazon-sde',
    title: 'Amazon SDE',
    description: 'Crack Amazon\'s leadership principles & coding',
    progress: 0,
    modules: [
      { title: 'Leadership Principles', status: 'not-started', problems: 14 },
      { title: 'OOP Design', status: 'locked', problems: 10 },
      { title: 'Scalable Systems', status: 'locked', problems: 8 },
    ],
  },
]

export default function LMSPath() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Learning Paths</h1>
        <p className="text-gray-400 mt-1">Structured roadmaps to ace interviews at top companies</p>
      </div>

      <div className="grid gap-6">
        {learningPaths.map((path) => (
          <Card key={path.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{path.title}</CardTitle>
                  <p className="text-gray-400 text-sm mt-1">{path.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{path.progress}%</p>
                  <p className="text-xs text-gray-400">Complete</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-700 rounded-full mt-4">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${path.progress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {path.modules.map((module, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      module.status === 'locked'
                        ? 'bg-gray-800/30 border-gray-800 opacity-60'
                        : module.status === 'completed'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-gray-800/50 border-gray-700 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {module.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : module.status === 'locked' ? (
                        <Lock className="h-5 w-5 text-gray-500" />
                      ) : module.status === 'in-progress' ? (
                        <Play className="h-5 w-5 text-indigo-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium text-white">{module.title}</p>
                        <p className="text-xs text-gray-400">{module.problems} problems</p>
                      </div>
                    </div>
                    {module.status !== 'locked' && (
                      <Button
                        variant={module.status === 'completed' ? 'ghost' : 'default'}
                        size="sm"
                      >
                        {module.status === 'completed' ? 'Review' : 'Continue'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
