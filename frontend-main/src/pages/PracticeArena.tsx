import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const mockProblems = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', category: 'Array', acceptance: '49%', solved: true, companies: ['Google', 'Amazon', 'Meta'] },
  { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', category: 'Linked List', acceptance: '40%', solved: true, companies: ['Microsoft', 'Amazon'] },
  { id: 3, title: 'Longest Substring Without Repeating', difficulty: 'Medium', category: 'String', acceptance: '33%', solved: false, companies: ['Google', 'Meta'] },
  { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', category: 'Binary Search', acceptance: '36%', solved: false, companies: ['Google', 'Apple'] },
  { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', category: 'DP', acceptance: '32%', solved: false, companies: ['Amazon', 'Microsoft'] },
  { id: 6, title: 'Container With Most Water', difficulty: 'Medium', category: 'Two Pointers', acceptance: '54%', solved: true, companies: ['Meta', 'Google'] },
  { id: 7, title: 'Regular Expression Matching', difficulty: 'Hard', category: 'DP', acceptance: '28%', solved: false, companies: ['Google', 'Meta'] },
  { id: 8, title: '3Sum', difficulty: 'Medium', category: 'Array', acceptance: '32%', solved: false, companies: ['Amazon', 'Meta'] },
]

const difficultyColors = {
  Easy: 'text-green-400 bg-green-500/20 border-green-500/30',
  Medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  Hard: 'text-red-400 bg-red-500/20 border-red-500/30',
}

export default function PracticeArena() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  const filteredProblems = mockProblems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = !selectedDifficulty || problem.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  const solvedCount = mockProblems.filter((p) => p.solved).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Practice Arena</h1>
          <p className="text-gray-400 mt-1">Solve coding problems to prepare for interviews</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{solvedCount}/{mockProblems.length}</p>
            <p className="text-sm text-gray-400">Problems Solved</p>
          </div>
          <div className="w-24 h-24">
            <svg className="transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-gray-700"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-indigo-500"
                strokeWidth="2"
                strokeDasharray={`${(solvedCount / mockProblems.length) * 100} 100`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search problems..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['Easy', 'Medium', 'Hard'].map((diff) => (
            <Button
              key={diff}
              variant={selectedDifficulty === diff ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
              className={cn(
                selectedDifficulty === diff && difficultyColors[diff as keyof typeof difficultyColors]
              )}
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Title</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Difficulty</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acceptance</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Companies</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem) => (
                  <tr
                    key={problem.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-4">
                      {problem.solved ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-600" />
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/practice/${problem.id}`}
                        className="text-white hover:text-indigo-400 transition-colors font-medium"
                      >
                        {problem.id}. {problem.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge className={difficultyColors[problem.difficulty as keyof typeof difficultyColors]}>
                        {problem.difficulty}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-400">{problem.category}</td>
                    <td className="p-4 text-gray-400">{problem.acceptance}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {problem.companies.slice(0, 2).map((company) => (
                          <Badge key={company} variant="outline" className="text-xs">
                            {company}
                          </Badge>
                        ))}
                        {problem.companies.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{problem.companies.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/practice/${problem.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
