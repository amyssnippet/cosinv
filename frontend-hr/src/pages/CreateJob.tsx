import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  Briefcase, 
  FileText, 
  Settings, 
  CheckCircle,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const steps = [
  { id: 1, name: 'Basic Info', icon: Briefcase },
  { id: 2, name: 'Description', icon: FileText },
  { id: 3, name: 'Requirements', icon: Settings },
  { id: 4, name: 'Review', icon: CheckCircle },
]

const experienceLevels = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Principal']
const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship']
const workModes = ['Remote', 'Hybrid', 'On-site']

export default function CreateJob() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    experienceLevel: '',
    employmentType: '',
    workMode: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    responsibilities: [''],
    requirements: [''],
    niceToHave: [''],
    skills: [] as string[],
    interviewStages: [
      { name: 'Technical Screening', type: 'ai', duration: '45' },
      { name: 'Coding Challenge', type: 'ai', duration: '60' },
    ],
  })
  const [skillInput, setSkillInput] = useState('')

  const updateField = (field: string, value: string | string[] | { name: string; type: string; duration: string }[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateArrayField = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }))
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleSubmit = () => {
    // Validate form
    if (!formData.title || !formData.department || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    // Submit form
    toast.success('Job posted successfully!')
    navigate('/jobs')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Create Job Posting</h1>
        <p className="text-slate-500">Fill in the details to create a new job posting</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-slate-300 text-slate-400'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:block ${
                currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Job Title *</label>
                  <Input
                    placeholder="e.g. Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Department *</label>
                  <Input
                    placeholder="e.g. Engineering"
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <Input
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Experience Level</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.experienceLevel}
                    onChange={(e) => updateField('experienceLevel', e.target.value)}
                  >
                    <option value="">Select level</option>
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Employment Type</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.employmentType}
                    onChange={(e) => updateField('employmentType', e.target.value)}
                  >
                    <option value="">Select type</option>
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Work Mode</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.workMode}
                    onChange={(e) => updateField('workMode', e.target.value)}
                  >
                    <option value="">Select mode</option>
                    {workModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Salary Range (USD)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={formData.salaryMin}
                      onChange={(e) => updateField('salaryMin', e.target.value)}
                    />
                    <span className="text-slate-400">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={formData.salaryMax}
                      onChange={(e) => updateField('salaryMax', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Job Description *</label>
                <Textarea
                  placeholder="Describe the role, team, and what success looks like..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Key Responsibilities</label>
                {formData.responsibilities.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                    <Input
                      placeholder="Add a responsibility..."
                      value={item}
                      onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('responsibilities', index)}
                      disabled={formData.responsibilities.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('responsibilities')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Responsibility
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Required Qualifications</label>
                {formData.requirements.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                    <Input
                      placeholder="Add a requirement..."
                      value={item}
                      onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('requirements', index)}
                      disabled={formData.requirements.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('requirements')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Requirement
                </Button>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Nice to Have</label>
                {formData.niceToHave.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                    <Input
                      placeholder="Add a nice-to-have..."
                      value={item}
                      onChange={(e) => updateArrayField('niceToHave', index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem('niceToHave', index)}
                      disabled={formData.niceToHave.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('niceToHave')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Nice to Have
                </Button>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Required Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {skill}
                      <button 
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button variant="outline" onClick={addSkill}>Add</Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Ready to publish</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Review your job posting details before publishing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Title:</span>
                      <span className="font-medium text-slate-900">{formData.title || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-medium text-slate-900">{formData.department || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium text-slate-900">{formData.location || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Experience:</span>
                      <span className="font-medium text-slate-900">{formData.experienceLevel || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Type:</span>
                      <span className="font-medium text-slate-900">{formData.employmentType || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Work Mode:</span>
                      <span className="font-medium text-slate-900">{formData.workMode || 'Not set'}</span>
                    </div>
                    {formData.salaryMin && formData.salaryMax && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Salary:</span>
                        <span className="font-medium text-slate-900">
                          ${Number(formData.salaryMin).toLocaleString()} - ${Number(formData.salaryMax).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Skills & Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {formData.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {formData.skills.length === 0 && (
                        <span className="text-sm text-slate-400">No skills added</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {formData.requirements.filter(r => r).length} requirements, {' '}
                      {formData.niceToHave.filter(n => n).length} nice-to-haves
                    </p>
                  </CardContent>
                </Card>
              </div>

              {formData.description && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {formData.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        {currentStep < 4 ? (
          <Button onClick={() => setCurrentStep(prev => prev + 1)} className="bg-blue-600 hover:bg-blue-700">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Publish Job
          </Button>
        )}
      </div>
    </div>
  )
}
