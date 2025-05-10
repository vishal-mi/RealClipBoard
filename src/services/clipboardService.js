import { supabase } from '../supabaseClient'

// Fetch all clips (names only)
export const fetchAllClips = async () => {
  const { data, error } = await supabase
    .from('clips')
    .select('id, name')
    .order('name')
  
  if (error) throw error
  return data
}

// Fetch a specific clip with all its items
export const fetchClipByName = async (clipName) => {
  // First get the clip
  const { data: clip, error: clipError } = await supabase
    .from('clips')
    .select('id, name')
    .eq('name', clipName)
    .single()
  
  if (clipError) throw clipError
  if (!clip) return null
  
  // Then get all items for this clip
  const { data: items, error: itemsError } = await supabase
    .from('clip_items')
    .select('position, content')
    .eq('clip_id', clip.id)
    .order('position')
  
  if (itemsError) throw itemsError
  
  // Convert to the format expected by the app
  const clipData = Array(20).fill('')
  items.forEach(item => {
    // Position is 1-based in the database, but 0-based in the array
    clipData[item.position - 1] = item.content || ''
  })
  
  return {
    name: clip.name,
    data: clipData
  }
}

// Save a clip with all its items
export const saveClip = async (clipName, clipData) => {
  // Start a transaction
  const { error: transactionError } = await supabase.rpc('save_clip', {
    p_clip_name: clipName,
    p_clip_items: clipData.map((content, index) => ({
      position: index + 1,
      content: content || ''
    }))
  })
  
  if (transactionError) throw transactionError
  
  return { success: true }
}

// Alternative implementation without stored procedure
export const saveClipAlternative = async (clipName, clipData) => {
  // Start a transaction
  try {
    // Check if clip exists
    const { data: existingClip } = await supabase
      .from('clips')
      .select('id')
      .eq('name', clipName)
      .single()
    
    let clipId
    
    if (existingClip) {
      // Update existing clip
      clipId = existingClip.id
      
      // Update the updated_at timestamp
      await supabase
        .from('clips')
        .update({ updated_at: new Date() })
        .eq('id', clipId)
      
      // Delete all existing items
      await supabase
        .from('clip_items')
        .delete()
        .eq('clip_id', clipId)
    } else {
      // Create new clip
      const { data: newClip, error: insertError } = await supabase
        .from('clips')
        .insert({ name: clipName })
        .select('id')
        .single()
      
      if (insertError) throw insertError
      clipId = newClip.id
    }
    
    // Insert all items
    const items = clipData.map((content, index) => ({
      clip_id: clipId,
      position: index + 1,
      content: content || ''
    }))
    
    // Only insert non-empty items to save space
    const nonEmptyItems = items.filter(item => item.content.trim() !== '')
    
    if (nonEmptyItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('clip_items')
        .insert(nonEmptyItems)
      
      if (itemsError) throw itemsError
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error saving clip:', error)
    throw error
  }
}

// Delete a clip
export const deleteClip = async (clipName) => {
  // Get the clip id first
  const { data: clip, error: clipError } = await supabase
    .from('clips')
    .select('id')
    .eq('name', clipName)
    .single()
  
  if (clipError) throw clipError
  if (!clip) return { success: false, message: 'Clip not found' }
  
  // Delete the clip (cascade will delete items)
  const { error: deleteError } = await supabase
    .from('clips')
    .delete()
    .eq('id', clip.id)
  
  if (deleteError) throw deleteError
  
  return { success: true }
}