'use client'

import { useState } from 'react'
import { Upload, FileAudio, Music, Globe, Download, CheckCircle } from 'lucide-react'

export default function Home() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [jobId, setJobId] = useState<string | null>(null)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [voiceFile, setVoiceFile] = useState<File | null>(null)
  const [bedFile, setBedFile] = useState<File | null>(null)

  const languages = [
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)' },
    { code: 'ja-JP', name: 'Japanese (Japan)' },
    { code: 'ko-KR', name: 'Korean (South Korea)' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'ru-RU', name: 'Russian (Russia)' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
  ]

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(lang => lang !== langCode)
        : [...prev, langCode]
    )
  }

  const handleFileUpload = (file: File, type: 'voice' | 'bed') => {
    if (type === 'voice') {
      setVoiceFile(file)
    } else {
      setBedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!voiceFile || !bedFile || selectedLanguages.length === 0) {
      alert('Please select both audio files and at least one target language')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('voice_file', voiceFile)
      formData.append('bed_file', bedFile)
      formData.append('languages', selectedLanguages.join(','))
      formData.append('source_language', 'en-US')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to create job')
      }

      const result = await response.json()
      setJobId(result.job_id)
      setUploadProgress(100)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            YouTube Multilingual Dubbing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your YouTube videos with AI-powered multilingual dubbing. 
            Upload your voice and background audio, select target languages, 
            and get professional-quality dubbed content.
          </p>
        </div>

        {/* Pipeline Diagram */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <FileAudio className="w-5 h-5 text-blue-600" />
              <span>Voice + Bed</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
              <span>STT</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
              <span>MT</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <span>TTS/Clone</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
              <span>Align</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
              <span>Mix</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
              <Download className="w-5 h-5 text-indigo-600" />
              <span>Export</span>
            </div>
          </div>
        </div>

        {!jobId ? (
          /* Upload Form */
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* File Upload Section */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Voice File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice-Only Audio File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-sm text-gray-600 mb-2">
                      {voiceFile ? voiceFile.name : 'Click to upload or drag and drop'}
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'voice')}
                      className="hidden"
                      id="voice-upload"
                    />
                    <label
                      htmlFor="voice-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                </div>

                {/* Background File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Music/Bed Audio
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-sm text-gray-600 mb-2">
                      {bedFile ? bedFile.name : 'Click to upload or drag and drop'}
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'bed')}
                      className="hidden"
                      id="bed-upload"
                    />
                    <label
                      htmlFor="bed-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Target Languages
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {languages.map((lang) => (
                    <label
                      key={lang.code}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedLanguages.includes(lang.code)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang.code)}
                        onChange={() => handleLanguageToggle(lang.code)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{lang.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Uploading files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || !voiceFile || !bedFile || selectedLanguages.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Processing...' : 'Start Dubbing Process'}
              </button>
            </form>
          </div>
        ) : (
          /* Job Status */
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Job Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your dubbing job is being processed. This may take a few minutes.
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Job ID:</p>
                <p className="font-mono text-lg">{jobId}</p>
              </div>
              <a
                href={`/jobs/${jobId}`}
                className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Job Status
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}