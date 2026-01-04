import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Briefcase,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock job data
const mockJob = {
  id: '1',
  title: 'Senior Software Engineer',
  company: 'Google',
  companyDescription: 'Google is a multinational technology company specializing in Internet-related services and products.',
  location: 'Mountain View, CA',
  salary: '$180K - $250K',
  type: 'Full-time',
  experience: '5+ years',
  teamSize: '10-20',
  posted: '2 days ago',
  deadline: '2026-02-01',
  skills: ['Python', 'Go', 'Kubernetes', 'System Design', 'AWS', 'Docker'],
  logo: 'G',
  description: `We are looking for a Senior Software Engineer to join our Cloud Platform team. You will be responsible for designing and building scalable distributed systems that power Google Cloud.

As a Senior Software Engineer, you will work on challenging problems at scale, collaborating with talented engineers across multiple teams.`,
  responsibilities: [
    'Design and implement scalable backend services',
    'Lead technical design discussions and code reviews',
    'Mentor junior engineers and contribute to team growth',
    'Collaborate with product managers to define requirements',
    'Improve system reliability and performance',
  ],
  requirements: [
    '5+ years of software engineering experience',
    'Strong proficiency in Python, Go, or Java',
    'Experience with distributed systems and microservices',
    'Knowledge of Kubernetes and container orchestration',
    'Excellent problem-solving and communication skills',
  ],
  benefits: [
    'Competitive salary and equity',
    'Comprehensive health insurance',
    'Unlimited PTO',
    'Remote work flexibility',
    'Learning and development budget',
  ],
  interviewProcess: [
    { stage: 'Application Review', duration: '1 week' },
    { stage: 'Phone Screen', duration: '45 mins' },
    { stage: 'Technical Interview (AI)', duration: '1 hour' },
    { stage: 'System Design Round', duration: '1 hour' },
    { stage: 'Final Round', duration: '2 hours' },
  ],
}

export default function JobDetail() {
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/jobs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Job Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-white">{mockJob.logo}</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">{mockJob.title}</h1>
                  <p className="text-lg text-gray-400">{mockJob.company}</p>
                </div>
                <Button size="lg" asChild>
                  <Link to={`/interview/setup/${id}`}>
                    Apply & Start Interview
                  </Link>
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {mockJob.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {mockJob.salary}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {mockJob.type}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {mockJob.teamSize} people
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Posted {mockJob.posted}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {mockJob.skills.map((skill) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-line">{mockJob.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockJob.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockJob.requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Interview Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockJob.interviewProcess.map((stage, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-indigo-400">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{stage.stage}</p>
                      <p className="text-xs text-gray-500">{stage.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockJob.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">About {mockJob.company}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">{mockJob.companyDescription}</p>
              <Button variant="ghost" className="w-full mt-4 gap-2">
                <ExternalLink className="h-4 w-4" />
                Visit Website
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
