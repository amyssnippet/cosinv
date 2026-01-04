import { useParams } from 'react-router-dom'
import { MapPin, Link as LinkIcon, Github, Calendar, Trophy, Code2, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ActivityHeatmap from '@/components/features/ActivityHeatmap'

const mockUser = {
  name: 'Alex Johnson',
  username: 'alexj',
  avatar: null,
  bio: 'Full Stack Developer | Open Source Enthusiast | Building cool stuff with React & Go',
  location: 'San Francisco, CA',
  website: 'https://alexj.dev',
  github: 'alexjohnson',
  linkedin: 'alexjohnson',
  joinedDate: 'January 2024',
  stats: {
    problemsSolved: 127,
    interviews: 15,
    score: 2450,
    rank: 342,
    streak: 12,
    longestStreak: 45,
  },
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Go', 'PostgreSQL', 'AWS'],
  badges: [
    { name: '100 Problems', icon: '🏆' },
    { name: 'Interview Ace', icon: '⭐' },
    { name: '30 Day Streak', icon: '🔥' },
    { name: 'Top 500', icon: '🥇' },
  ],
  recentActivity: [
    { type: 'problem', title: 'Solved "Two Sum"', time: '2 hours ago' },
    { type: 'interview', title: 'Completed Google Interview', time: '1 day ago' },
    { type: 'problem', title: 'Solved "Valid Parentheses"', time: '2 days ago' },
  ],
}

export default function UserProfile() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username: _username } = useParams()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={mockUser.avatar || undefined} />
              <AvatarFallback className="text-4xl">{mockUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">{mockUser.name}</h1>
                  <p className="text-gray-400">@{mockUser.username}</p>
                </div>
                <Button>Edit Profile</Button>
              </div>
              
              <p className="text-gray-300 mt-3 max-w-2xl">{mockUser.bio}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                {mockUser.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {mockUser.location}
                  </span>
                )}
                {mockUser.website && (
                  <a href={mockUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400">
                    <LinkIcon className="h-4 w-4" />
                    {mockUser.website.replace('https://', '')}
                  </a>
                )}
                <a href={`https://github.com/${mockUser.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400">
                  <Github className="h-4 w-4" />
                  {mockUser.github}
                </a>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {mockUser.joinedDate}
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {mockUser.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats & Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <Code2 className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{mockUser.stats.problemsSolved}</p>
                <p className="text-xs text-gray-400">Problems Solved</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">#{mockUser.stats.rank}</p>
                <p className="text-xs text-gray-400">Global Rank</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{mockUser.stats.streak}</p>
                <p className="text-xs text-gray-400">Day Streak</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <p className="text-2xl font-bold text-white">{mockUser.stats.score}</p>
                <p className="text-xs text-gray-400">Total Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {mockUser.badges.map((badge) => (
                <div
                  key={badge.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-sm text-gray-300">{badge.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUser.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'problem' ? 'bg-green-500' : 'bg-indigo-500'}`} />
                  <div>
                    <p className="text-sm text-gray-300">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contribution Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap />
        </CardContent>
      </Card>
    </div>
  )
}
