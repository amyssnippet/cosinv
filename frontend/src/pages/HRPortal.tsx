import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  Building,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Video,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Download
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  status: 'draft' | 'open' | 'paused' | 'closed';
  applicationsCount: number;
  viewsCount: number;
  postedAt: string;
  expiresAt: string | null;
}

interface Candidate {
  applicationId: string;
  status: string;
  appliedAt: string;
  scores: {
    total: number | null;
    technical: number | null;
    behavioral: number | null;
    communication: number | null;
  };
  aiInterviewCompleted: boolean;
  cheatingIncidents: number;
  candidate: {
    id: string;
    email: string;
    username: string;
    name: string;
    avatar: string;
    headline: string;
    skills: string[];
    stats: {
      problemsSolved: number;
      currentStreak: number;
    };
  };
}

interface HRDashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingReview: number;
  interviewsScheduled: number;
  offersExtended: number;
}

const HRPortal: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'jobs' | 'candidates' | 'create-job'>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<HRDashboardStats>({
    totalJobs: 12,
    activeJobs: 8,
    totalApplications: 247,
    pendingReview: 34,
    interviewsScheduled: 15,
    offersExtended: 3
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    minScore: '',
    maxScore: ''
  });

  // Mock data
  useEffect(() => {
    setJobs([
      { id: '1', title: 'Senior Software Engineer', status: 'open', applicationsCount: 45, viewsCount: 234, postedAt: '2025-12-15', expiresAt: '2026-02-15' },
      { id: '2', title: 'Frontend Developer', status: 'open', applicationsCount: 67, viewsCount: 456, postedAt: '2025-12-20', expiresAt: '2026-02-20' },
      { id: '3', title: 'Backend Engineer', status: 'open', applicationsCount: 32, viewsCount: 189, postedAt: '2025-12-25', expiresAt: '2026-02-25' },
      { id: '4', title: 'DevOps Engineer', status: 'paused', applicationsCount: 23, viewsCount: 156, postedAt: '2025-12-10', expiresAt: null },
      { id: '5', title: 'Product Manager', status: 'closed', applicationsCount: 89, viewsCount: 567, postedAt: '2025-11-01', expiresAt: '2025-12-01' }
    ]);

    setCandidates([
      {
        applicationId: '1',
        status: 'ai_interview',
        appliedAt: '2026-01-02',
        scores: { total: 85, technical: 88, behavioral: 82, communication: 80 },
        aiInterviewCompleted: true,
        cheatingIncidents: 0,
        candidate: {
          id: 'c1',
          email: 'john@example.com',
          username: 'johndoe',
          name: 'John Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
          headline: 'Full Stack Developer',
          skills: ['React', 'Node.js', 'TypeScript'],
          stats: { problemsSolved: 156, currentStreak: 12 }
        }
      },
      {
        applicationId: '2',
        status: 'hr_review',
        appliedAt: '2026-01-01',
        scores: { total: 72, technical: 75, behavioral: 70, communication: 68 },
        aiInterviewCompleted: true,
        cheatingIncidents: 1,
        candidate: {
          id: 'c2',
          email: 'jane@example.com',
          username: 'janesmith',
          name: 'Jane Smith',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
          headline: 'Software Engineer at TechCorp',
          skills: ['Python', 'Django', 'AWS'],
          stats: { problemsSolved: 89, currentStreak: 5 }
        }
      },
      {
        applicationId: '3',
        status: 'applied',
        appliedAt: '2026-01-03',
        scores: { total: null, technical: null, behavioral: null, communication: null },
        aiInterviewCompleted: false,
        cheatingIncidents: 0,
        candidate: {
          id: 'c3',
          email: 'bob@example.com',
          username: 'bobwilson',
          name: 'Bob Wilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
          headline: 'Junior Developer',
          skills: ['JavaScript', 'React'],
          stats: { problemsSolved: 34, currentStreak: 2 }
        }
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400';
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'closed': return 'bg-red-500/20 text-red-400';
      case 'ai_interview': return 'bg-purple-500/20 text-purple-400';
      case 'hr_review': return 'bg-blue-500/20 text-blue-400';
      case 'applied': return 'bg-gray-500/20 text-gray-400';
      case 'offered': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs">Total Jobs</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalJobs}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Active</span>
          </div>
          <p className="text-2xl font-bold">{stats.activeJobs}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Applications</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalApplications}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-yellow-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Pending Review</span>
          </div>
          <p className="text-2xl font-bold">{stats.pendingReview}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Video className="w-4 h-4" />
            <span className="text-xs">Interviews</span>
          </div>
          <p className="text-2xl font-bold">{stats.interviewsScheduled}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Offers</span>
          </div>
          <p className="text-2xl font-bold">{stats.offersExtended}</p>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50">
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <h3 className="font-semibold">Recent Applications</h3>
          <button 
            onClick={() => setActiveView('candidates')}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-gray-700/50">
          {candidates.slice(0, 5).map(c => (
            <div key={c.applicationId} className="p-4 flex items-center justify-between hover:bg-gray-700/20">
              <div className="flex items-center gap-3">
                <img 
                  src={c.candidate.avatar} 
                  alt={c.candidate.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{c.candidate.name}</p>
                  <p className="text-sm text-gray-400">{c.candidate.headline}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(c.status)}`}>
                  {c.status.replace('_', ' ')}
                </span>
                {c.scores.total !== null && (
                  <span className={`text-lg font-bold ${getScoreColor(c.scores.total)}`}>
                    {c.scores.total}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50">
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <h3 className="font-semibold">Your Job Postings</h3>
          <button 
            onClick={() => setActiveView('jobs')}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-gray-700/50">
          {jobs.slice(0, 5).map(job => (
            <div 
              key={job.id} 
              className="p-4 flex items-center justify-between hover:bg-gray-700/20 cursor-pointer"
              onClick={() => {
                setSelectedJob(job);
                setActiveView('candidates');
              }}
            >
              <div>
                <p className="font-medium">{job.title}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                  <span>{job.applicationsCount} applications</span>
                  <span>{job.viewsCount} views</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Job Postings</h2>
        <button
          onClick={() => setActiveView('create-job')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <select className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Jobs Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/30">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Job Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Applications</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Views</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Posted</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-700/20">
                <td className="px-4 py-3">
                  <p className="font-medium">{job.title}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{job.applicationsCount}</td>
                <td className="px-4 py-3 text-gray-300">{job.viewsCount}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {new Date(job.postedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => {
                        setSelectedJob(job);
                        setActiveView('candidates');
                      }}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="View Candidates"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {selectedJob ? `Candidates for ${selectedJob.title}` : 'All Candidates'}
          </h2>
          {selectedJob && (
            <button 
              onClick={() => setSelectedJob(null)}
              className="text-sm text-gray-400 hover:text-white mt-1"
            >
              ← View all jobs
            </button>
          )}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <select 
          className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="applied">Applied</option>
          <option value="ai_interview">AI Interview</option>
          <option value="hr_review">HR Review</option>
          <option value="final_round">Final Round</option>
          <option value="offered">Offered</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Score:</span>
          <input
            type="number"
            placeholder="Min"
            className="w-20 px-3 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            value={filters.minScore}
            onChange={(e) => setFilters({...filters, minScore: e.target.value})}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            className="w-20 px-3 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            value={filters.maxScore}
            onChange={(e) => setFilters({...filters, maxScore: e.target.value})}
          />
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid gap-4">
        {candidates.map(c => (
          <div 
            key={c.applicationId}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              {/* Candidate Info */}
              <div className="flex items-start gap-4">
                <img 
                  src={c.candidate.avatar} 
                  alt={c.candidate.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{c.candidate.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                    {c.cheatingIncidents > 0 && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        {c.cheatingIncidents} flag{c.cheatingIncidents > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{c.candidate.headline}</p>
                  <p className="text-gray-500 text-sm">{c.candidate.email}</p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {c.candidate.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>{c.candidate.stats.problemsSolved} problems solved</span>
                    <span>🔥 {c.candidate.stats.currentStreak} day streak</span>
                    <span>Applied {new Date(c.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="text-right">
                {c.scores.total !== null ? (
                  <div>
                    <div className={`text-4xl font-bold ${getScoreColor(c.scores.total)}`}>
                      {c.scores.total}%
                    </div>
                    <p className="text-sm text-gray-400 mt-1">AI Score</p>
                    
                    {/* Score breakdown */}
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-400">Technical</span>
                        <span className={getScoreColor(c.scores.technical)}>{c.scores.technical}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-400">Behavioral</span>
                        <span className={getScoreColor(c.scores.behavioral)}>{c.scores.behavioral}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-400">Communication</span>
                        <span className={getScoreColor(c.scores.communication)}>{c.scores.communication}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Awaiting Interview</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-700/50">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors">
                <Eye className="w-4 h-4" />
                View Profile
              </button>
              {c.aiInterviewCompleted && (
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <Play className="w-4 h-4" />
                  Watch Replay
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <Video className="w-4 h-4" />
                Schedule Call
              </button>
              <div className="flex-1" />
              <select 
                className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                value={c.status}
              >
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="ai_interview">AI Interview</option>
                <option value="hr_review">HR Review</option>
                <option value="final_round">Final Round</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreateJob = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Create New Job Posting</h2>
      
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
          <input
            type="text"
            placeholder="e.g. Senior Software Engineer"
            className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA"
              className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location Type</label>
            <select className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500">
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
          <textarea
            rows={6}
            placeholder="Describe the role and responsibilities..."
            className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Required Skills</label>
          <input
            type="text"
            placeholder="e.g. React, Node.js, TypeScript (comma separated)"
            className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Experience (Years)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range (USD)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* AI Interview Settings */}
        <div className="pt-6 border-t border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4">AI Interview Settings</h3>
          
          <div className="flex items-center gap-4 mb-4">
            <input type="checkbox" id="ai-enabled" defaultChecked className="w-4 h-4" />
            <label htmlFor="ai-enabled" className="text-sm">Enable AI-powered technical interviews</label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Interview Duration</label>
              <select className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Number of Rounds</label>
              <select className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="1">1 Round</option>
                <option value="2">2 Rounds</option>
                <option value="3">3 Rounds</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6">
          <button
            onClick={() => setActiveView('jobs')}
            className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
            Save as Draft
          </button>
          <button className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors">
            Publish Job
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-gray-800/50 border-r border-gray-700/50 p-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">HR Portal</p>
              <p className="text-xs text-gray-400">TechCorp Inc.</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'dashboard' ? 'bg-purple-600' : 'hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('jobs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'jobs' ? 'bg-purple-600' : 'hover:bg-gray-700'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Jobs
            </button>
            <button
              onClick={() => {
                setSelectedJob(null);
                setActiveView('candidates');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'candidates' ? 'bg-purple-600' : 'hover:bg-gray-700'
              }`}
            >
              <Users className="w-5 h-5" />
              Candidates
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'jobs' && renderJobs()}
          {activeView === 'candidates' && renderCandidates()}
          {activeView === 'create-job' && renderCreateJob()}
        </div>
      </div>
    </div>
  );
};

export default HRPortal;
