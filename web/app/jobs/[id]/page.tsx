'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Download, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface JobStatus {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  source_language: string
  target_languages: string[]
  outputs: Record<string, {
    voice_only: string
    full_mix: string
    captions: string
  }>
  error?: string
}

export default function JobStatusPage() {
  const params = useParams()
  const jobId = params.id as string
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/${jobId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch job status')
      }

      const data = await response.json()
      setJobStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobStatus()
    
    // Poll for updates if job is still processing
    const interval = setInterval(() => {
      if (jobStatus?.status === 'pending' || jobStatus?.status === 'processing') {
        fetchJobStatus()
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [jobId, jobStatus?.status])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'processing':
        return <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      case 'processing':
        return 'Processing'
      default:
        return 'Pending'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'processing':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const downloadFile = async (lang: string, type: 'full' | 'voice' | 'captions') => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/${jobId}/download?lang=${lang}&type=${type}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${jobId}-${lang}-${type}.${type === 'captions' ? 'srt' : 'm4a'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download file')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchJobStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!jobStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Job not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Job Status</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(jobStatus.status)}`}>
              {getStatusIcon(jobStatus.status)}
              <span className="font-medium">{getStatusText(jobStatus.status)}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Job ID:</span>
                  <span className="ml-2 font-mono">{jobStatus.job_id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Created:</span>
                  <span className="ml-2">{new Date(jobStatus.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Source Language:</span>
                  <span className="ml-2">{jobStatus.source_language}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Target Languages:</span>
                  <span className="ml-2">{jobStatus.target_languages.join(', ')}</span>
                </div>
              </div>
            </div>

            {jobStatus.error && (
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{jobStatus.error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Outputs */}
        {jobStatus.status === 'completed' && Object.keys(jobStatus.outputs).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Download Files</h2>
            
            <div className="space-y-6">
              {Object.entries(jobStatus.outputs).map(([lang, files]) => (
                <div key={lang} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {lang.toUpperCase()} - {lang}
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Voice Only</h4>
                        <p className="text-sm text-gray-600">Clean voice track</p>
                      </div>
                      <button
                        onClick={() => downloadFile(lang, 'voice')}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>

                    <div className="text-center">
                      <div className="bg-green-50 rounded-lg p-4 mb-3">
                        <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Full Mix</h4>
                        <p className="text-sm text-gray-600">Voice + background</p>
                      </div>
                      <button
                        onClick={() => downloadFile(lang, 'full')}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>

                    <div className="text-center">
                      <div className="bg-purple-50 rounded-lg p-4 mb-3">
                        <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Captions</h4>
                        <p className="text-sm text-gray-600">SRT subtitle file</p>
                      </div>
                      <button
                        onClick={() => downloadFile(lang, 'captions')}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Status */}
        {(jobStatus.status === 'pending' || jobStatus.status === 'processing') && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Your Job
            </h2>
            <p className="text-gray-600 mb-4">
              This may take a few minutes. The page will automatically update when complete.
            </p>
            <button
              onClick={fetchJobStatus}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        )}
      </div>
    </div>
  )
}