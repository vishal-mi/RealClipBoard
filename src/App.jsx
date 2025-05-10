import { useState, useEffect, useRef } from 'react'
import './App.css'
import { saveClip, fetchClipByName, fetchAllClips } from './services/clipboardService'

const App = () => {
  const [clipName, setClipName] = useState('')
  const [loadClipName, setLoadClipName] = useState('')
  const [clipData, setClipData] = useState(Array(20).fill(''))
  const [currentClip, setCurrentClip] = useState('Untitled')
  const [availableClips, setAvailableClips] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch available clips on component mount
  useEffect(() => {
    const loadAvailableClips = async () => {
      try {
        const clips = await fetchAllClips()
        setAvailableClips(clips)
      } catch (err) {
        console.error('Error loading clips:', err)
        setError('Failed to load available clips')
      }
    }
    
    loadAvailableClips()
  }, [])

  const handleSaveClip = async () => {
    if (!clipName.trim()) {
      alert('Please enter a clip name')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Save to Supabase
      await saveClip(clipName, clipData)
      setCurrentClip(clipName)
      setClipName('')
      
      // Refresh the list of available clips
      const clips = await fetchAllClips()
      setAvailableClips(clips)
      
      alert(`Clip "${clipName}" saved successfully!`)
    } catch (err) {
      console.error('Error saving clip:', err)
      setError('Failed to save clip')
      alert('Failed to save clip. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadClip = async () => {
    if (!loadClipName.trim()) {
      alert('Please enter a clip name to load')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const clip = await fetchClipByName(loadClipName)
      if (clip) {
        setClipData(clip.data)
        setCurrentClip(clip.name)
        setLoadClipName('')
      } else {
        alert(`Clip "${loadClipName}" not found!`)
      }
    } catch (err) {
      console.error('Error loading clip:', err)
      setError('Failed to load clip')
      alert('Failed to load clip. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyToClipboard = (text) => {
    if (!text.trim()) {
      alert('Nothing to copy!')
      return
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!')
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
        alert('Failed to copy to clipboard')
      })
  }

  const handleClearRow = (index) => {
    const newClipData = [...clipData]
    newClipData[index] = ''
    setClipData(newClipData)
  }

  const handleRowChange = (index, value) => {
    const newClipData = [...clipData]
    newClipData[index] = value
    setClipData(newClipData)
  }
  
  // Reference to store all textarea elements
  const textareaRefs = useRef([])
  
  // Function to resize all textareas
  const resizeAllTextareas = () => {
    textareaRefs.current.forEach(textarea => {
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
    })
  }
  
  // Resize textareas when clipData changes (e.g., after loading a clip)
  useEffect(() => {
    resizeAllTextareas()
  }, [clipData])

  return (
    <div className="clipboard-container">
      <h1 className="app-title">Quick Clipboard</h1>
      
      <div className="controls-container">
        <div className="control-group">
          <input
            type="text"
            value={clipName}
            onChange={(e) => setClipName(e.target.value)}
            placeholder="Enter clip name"
            className="clip-input"
            disabled={isLoading}
          />
          <button 
            onClick={handleSaveClip} 
            className="action-button"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
        
        <div className="control-group">
          <select
            value={loadClipName}
            onChange={(e) => setLoadClipName(e.target.value)}
            className="clip-input"
            disabled={isLoading}
          >
            <option value="">Select a clip to load</option>
            {availableClips.map(clip => (
              <option key={clip.id} value={clip.name}>
                {clip.name}
              </option>
            ))}
          </select>
          <button 
            onClick={handleLoadClip} 
            className="action-button"
            disabled={isLoading || !loadClipName}
          >
            {isLoading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <h2 className="current-clip">Current Clip: {currentClip}</h2>
      
      <div className="clip-rows">
        {clipData.map((row, index) => (
          <div key={index} className="clip-row">
            <span className="row-number">{index + 1}.</span>
            <textarea
              ref={el => textareaRefs.current[index] = el}
              value={row}
              onChange={(e) => handleRowChange(index, e.target.value)}
              placeholder={`Line ${index + 1}`}
              className="row-input"
              rows="1"
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <div className="row-actions">
              <button 
                onClick={() => handleCopyToClipboard(row)} 
                className="row-button copy-button"
                title="Copy to clipboard"
              >
                Copy
              </button>
              <button 
                onClick={() => handleClearRow(index)} 
                className="row-button clear-button"
                title="Clear row"
              >
                Clear
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App