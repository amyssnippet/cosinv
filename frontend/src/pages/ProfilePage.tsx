import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Link as LinkIcon, 
  Github, 
  Linkedin, 
  Calendar,
  Trophy,
  Flame,
  Code,
  Target,
  Star,
  ChevronRight,
  Building
} from 'lucide-react';
import GreenChart from '../components/GreenChart';

interface ProfileData {
  id: string;
  username: string;
  email: string;
  role: string;
  profile: {
    name: string;
    avatar: string;
    bio: string;
    headline: string;
    location: string;
    skills: string[];
    github: string;
    linkedin: string;
    portfolio: string;
    streak: {
      current: number;
      longest: number;
    };
    stats: {
      problemsSolved: number;
      interviewsCompleted: number;
      averageScore: number;
      easyCount: number;
      mediumCount: number;
      hardCount: number;
    };
  };
  createdAt: string;
}

interface ActivityData {
  date: string;
  count: number;
}

interface RecentActivity {
  id: string;
  type: 'problem_solved' | 'interview_completed';
  title: string;
  difficulty?: string;
  score?: number;
  date: string;
}

interface ProfilePageProps {
  username?: string;
  isOwnProfile?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  username: propUsername,
  isOwnProfile = false 
}) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'problems' | 'interviews'>('overview');

  // Get username from URL or props
  const username = propUsername || window.location.pathname.split('/u/')[1];

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const profileRes = await fetch(`/api/users/${username}`);
      if (!profileRes.ok) throw new Error('Profile not found');
      const profileData = await profileRes.json();
      setProfile(profileData);

      // Fetch activity data for green chart
      const activityRes = await fetch(`/api/users/${username}/activity?year=${new Date().getFullYear()}`);
      if (activityRes.ok) {
        const activityJson = await activityRes.json();
        setActivityData(activityJson.activity);
      }

      // Fetch recent activity
      const recentRes = await fetch(`/api/users/${username}/recent-activity?limit=10`);
      if (recentRes.ok) {
        const recentJson = await recentRes.json();
        setRecentActivity(recentJson.activities);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      // Use mock data for development
      setProfile(getMockProfile());
      setActivityData(getMockActivityData());
      setRecentActivity(getMockRecentActivity());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const getMockProfile = (): ProfileData => ({
    id: '1',
    username: username || 'johndoe',
    email: 'john@example.com',
    role: 'candidate',
    profile: {
      name: 'John Doe',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: 'Full-stack developer passionate about building scalable applications. Love solving algorithmic challenges and learning new technologies.',
      headline: 'Software Engineer | Open Source Enthusiast',
      location: 'San Francisco, CA',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'PostgreSQL', 'GraphQL'],
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      portfolio: 'https://johndoe.dev',
      streak: {
        current: 15,
        longest: 42
      },
      stats: {
        problemsSolved: 247,
        interviewsCompleted: 12,
        averageScore: 78.5,
        easyCount: 89,
        mediumCount: 124,
        hardCount: 34
      }
    },
    createdAt: '2024-06-15T00:00:00Z'
  });

  const getMockActivityData = (): ActivityData[] => {
    const data: ActivityData[] = [];
    const today = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate random activity (more activity on weekdays)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const random = Math.random();
      
      let count = 0;
      if (random > (isWeekend ? 0.7 : 0.4)) {
        count = Math.floor(Math.random() * (isWeekend ? 3 : 5)) + 1;
      }
      
      data.push({ date: dateStr, count });
    }
    
    return data;
  };

  const getMockRecentActivity = (): RecentActivity[] => [
    { id: '1', type: 'problem_solved', title: 'Two Sum', difficulty: 'Easy', date: '2026-01-03' },
    { id: '2', type: 'interview_completed', title: 'Google SDE Interview', score: 85, date: '2026-01-02' },
    { id: '3', type: 'problem_solved', title: 'LRU Cache', difficulty: 'Medium', date: '2026-01-02' },
    { id: '4', type: 'problem_solved', title: 'Merge K Sorted Lists', difficulty: 'Hard', date: '2026-01-01' },
    { id: '5', type: 'problem_solved', title: 'Valid Parentheses', difficulty: 'Easy', date: '2025-12-31' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400">Profile not found</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Profile Card */}
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img 
                    src={profile.profile.avatar} 
                    alt={profile.profile.name}
                    className="w-32 h-32 rounded-full border-4 border-purple-500/30"
                  />
                  {profile.profile.streak.current > 0 && (
                    <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-2">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold mt-4">{profile.profile.name}</h1>
                <p className="text-gray-400">@{profile.username}</p>
              </div>

              {/* Headline & Bio */}
              {profile.profile.headline && (
                <p className="text-sm text-gray-300 mb-2 text-center">{profile.profile.headline}</p>
              )}
              {profile.profile.bio && (
                <p className="text-sm text-gray-400 mb-4">{profile.profile.bio}</p>
              )}

              {/* Edit Profile Button */}
              {isOwnProfile && (
                <button className="w-full py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors mb-4">
                  Edit Profile
                </button>
              )}

              {/* Links */}
              <div className="space-y-2 mb-6">
                {profile.profile.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.profile.location}</span>
                  </div>
                )}
                {profile.profile.portfolio && (
                  <a 
                    href={profile.profile.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>{profile.profile.portfolio.replace('https://', '')}</span>
                  </a>
                )}
                {profile.profile.github && (
                  <a 
                    href={profile.profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.profile.linkedin && (
                  <a 
                    href={profile.profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Skills */}
              {profile.profile.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.profile.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 text-xs bg-gray-700/50 rounded-full text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="flex-1 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Code className="w-4 h-4" />
                  <span className="text-xs">Problems Solved</span>
                </div>
                <p className="text-2xl font-bold">{profile.profile.stats.problemsSolved}</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs">Interviews</span>
                </div>
                <p className="text-2xl font-bold">{profile.profile.stats.interviewsCompleted}</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-xs">Avg Score</span>
                </div>
                <p className="text-2xl font-bold">{profile.profile.stats.averageScore}%</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs">Current Streak</span>
                </div>
                <p className="text-2xl font-bold">{profile.profile.streak.current} days</p>
              </div>
            </div>

            {/* Problem Difficulty Breakdown */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4">Problem Difficulty</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-green-400">Easy</span>
                    <span className="text-sm text-gray-400">{profile.profile.stats.easyCount}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(profile.profile.stats.easyCount / profile.profile.stats.problemsSolved) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-yellow-400">Medium</span>
                    <span className="text-sm text-gray-400">{profile.profile.stats.mediumCount}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${(profile.profile.stats.mediumCount / profile.profile.stats.problemsSolved) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-red-400">Hard</span>
                    <span className="text-sm text-gray-400">{profile.profile.stats.hardCount}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(profile.profile.stats.hardCount / profile.profile.stats.problemsSolved) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Green Chart */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <GreenChart 
                data={activityData}
                colorScheme="green"
                onDayClick={(date, count) => {
                  console.log(`Clicked ${date}: ${count} activities`);
                }}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {recentActivity.map(activity => (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${activity.type === 'problem_solved' ? 'bg-green-500/10' : 'bg-purple-500/10'}
                      `}>
                        {activity.type === 'problem_solved' ? (
                          <Code className="w-5 h-5 text-green-400" />
                        ) : (
                          <Building className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <div className="flex items-center gap-2 text-sm">
                          {activity.difficulty && (
                            <span className={getDifficultyColor(activity.difficulty)}>
                              {activity.difficulty}
                            </span>
                          )}
                          {activity.score && (
                            <span className="text-gray-400">Score: {activity.score}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
