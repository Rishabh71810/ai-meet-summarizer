'use client'

import { useState } from 'react'
import './globals.css'

export default function Home() {
  const [transcript, setTranscript] = useState('')
  const [prompt, setPrompt] = useState('Summarize the key points from this meeting in bullet points')
  const [summary, setSummary] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [subject, setSubject] = useState('Meeting Summary')
  const [loading, setLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTranscript(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const generateSummary = async () => {
    if (!transcript.trim()) {
      setError('Please provide a transcript')
      return
    }

    if (!prompt.trim()) {
      setError('Please provide a summarization prompt')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, prompt }),
      })

      const data = await response.json()

      if (response.ok) {
        setSummary(data.summary)
        setShowSummary(true)
      } else {
        setError(data.error || 'Failed to generate summary')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async () => {
    if (!toEmail.trim()) {
      setEmailMessage('Please enter recipient email(s)')
      return
    }

    if (!summary.trim()) {
      setEmailMessage('Summary is empty')
      return
    }

    setEmailLoading(true)
    setEmailMessage('')

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          toEmail, 
          summary, 
          subject 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailMessage('Email sent successfully!')
      } else {
        setEmailMessage(data.error || 'Failed to send email')
      }
    } catch (error) {
      setEmailMessage('Network error. Please try again.')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>AI Meeting Summarizer</h1>

      <div className="section">
        <h2>1. Upload or Paste Transcript</h2>
        
        <div className="file-upload-wrapper">
          <label htmlFor="fileUpload">Upload Text File:</label>
          <input
            type="file"
            id="fileUpload"
            accept=".txt"
            onChange={handleFileUpload}
          />
        </div>

        <div className="or-divider">OR</div>

        <label htmlFor="transcript">Paste Transcript:</label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your meeting transcript here..."
        />
      </div>

      <div className="section">
        <h2>2. Custom Instruction</h2>
        <label htmlFor="prompt">Enter your summarization prompt:</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items'"
        />
      </div>

      <div className="section">
        <button onClick={generateSummary} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Summary'}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      {showSummary && (
        <div className="section">
          <h2>3. Generated Summary</h2>
          <label htmlFor="summary">Edit summary if needed:</label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <h2 style={{ marginTop: '24px' }}>Share via Email</h2>
          
          <label htmlFor="toEmail">To Email(s) (comma-separated for multiple):</label>
          <input
            type="email"
            id="toEmail"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="recipient1@example.com, recipient2@example.com"
          />

          <label htmlFor="subject">Email Subject:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />

          <button onClick={sendEmail} disabled={emailLoading}>
            {emailLoading ? 'Sending...' : 'Send Email'}
          </button>
          
          {emailMessage && (
            <div className={emailMessage.includes('success') ? 'success' : 'error'}>
              {emailMessage}
            </div>
          )}
        </div>
      )}
    </div>
  )
}