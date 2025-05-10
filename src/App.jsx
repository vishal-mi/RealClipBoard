import { useState, useEffect, useRef } from 'react'
import './App.css'

const App = () => {
  const [clipName, setClipName] = useState('')
  const [loadClipName, setLoadClipName] = useState('')
  const [clipData, setClipData] = useState(Array(20).fill(''))
  const [currentClip, setCurrentClip] = useState('Untitled')

  const handleSaveClip = () => {
    if (!clipName.trim()) {
      alert('Please enter a clip name')
      return
    }
    
    // Save to localStorage
    localStorage.setItem(clipName, JSON.stringify(clipData))
    setCurrentClip(clipName)
    setClipName('')
    alert(`Clip "${clipName}" saved successfully!`)
  }

  const handleLoadClip = () => {
    if (!loadClipName.trim()) {
      alert('Please enter a clip name to load')
      return
    }
    
    const savedClip = localStorage.getItem(loadClipName)
    if (savedClip) {
      setClipData(JSON.parse(savedClip))
      setCurrentClip(loadClipName)
      setLoadClipName('')
    } else {
      alert(`Clip "${loadClipName}" not found!`)
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
          />
          <button onClick={handleSaveClip} className="action-button">Save</button>
        </div>
        
        <div className="control-group">
          <input
            type="text"
            value={loadClipName}
            onChange={(e) => setLoadClipName(e.target.value)}
            placeholder="Enter clip name to load"
            className="clip-input"
          />
          <button onClick={handleLoadClip} className="action-button">Load</button>
        </div>
      </div>
      
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