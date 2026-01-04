import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, Video, VideoOff, Check, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function InterviewSetup() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
  })
  const [checking, setChecking] = useState(false)

  const checkPermissions = async () => {
    setChecking(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setPermissions({ camera: true, microphone: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      console.error('Permission error:', error)
    }
    setChecking(false)
  }

  const canStart = permissions.camera && permissions.microphone

  return (
    <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Interview Setup</CardTitle>
          <p className="text-gray-400">Let's make sure everything is ready before we start</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Checks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
              <div className="flex items-center gap-4">
                {permissions.camera ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Video className="h-5 w-5 text-green-500" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <VideoOff className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">Camera</p>
                  <p className="text-sm text-gray-400">
                    {permissions.camera ? 'Connected and ready' : 'Not connected'}
                  </p>
                </div>
              </div>
              {permissions.camera && <Check className="h-5 w-5 text-green-500" />}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
              <div className="flex items-center gap-4">
                {permissions.microphone ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Mic className="h-5 w-5 text-green-500" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <MicOff className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">Microphone</p>
                  <p className="text-sm text-gray-400">
                    {permissions.microphone ? 'Connected and ready' : 'Not connected'}
                  </p>
                </div>
              </div>
              {permissions.microphone && <Check className="h-5 w-5 text-green-500" />}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-white mb-2">Before you start:</p>
                <ul className="space-y-1 text-gray-400">
                  <li>• Ensure you're in a quiet, well-lit environment</li>
                  <li>• Have a stable internet connection</li>
                  <li>• Keep your face visible throughout the interview</li>
                  <li>• The interview will be recorded for review</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={checkPermissions}
              disabled={checking}
            >
              {checking ? (
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Check Devices'
              )}
            </Button>
            <Button
              className="flex-1"
              disabled={!canStart}
              onClick={() => navigate(`/interview/room/${id}`)}
            >
              Start Interview
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
