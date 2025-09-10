import React, { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

const EditSkillsModal = ({ isOpen, onClose, skills = [], onSave }) => {
  const [skillsList, setSkillsList] = useState([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillRating, setNewSkillRating] = useState(3)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Convert skills data format if needed
      if (skills && Array.isArray(skills)) {
        setSkillsList(skills.map(skill => ({
          name: skill.name || skill,
          rating: skill.rating || 3
        })))
      } else if (skills && typeof skills === 'object') {
        // Convert from ratings object format
        setSkillsList(Object.entries(skills).map(([name, rating]) => ({
          name,
          rating: Number(rating) || 3
        })))
      } else {
        setSkillsList([])
      }
    }
  }, [isOpen, skills])

  const addSkill = () => {
    if (newSkillName.trim()) {
      setSkillsList([...skillsList, { name: newSkillName.trim(), rating: newSkillRating }])
      setNewSkillName('')
      setNewSkillRating(3)
    }
  }

  const removeSkill = (index) => {
    setSkillsList(skillsList.filter((_, i) => i !== index))
  }

  const updateSkillRating = (index, rating) => {
    const updatedSkills = [...skillsList]
    updatedSkills[index] = { ...updatedSkills[index], rating: Number(rating) }
    setSkillsList(updatedSkills)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const handleSave = async () => {
    const validSkills = skillsList.filter(skill => skill.name.trim() !== '')

    setLoading(true)
    try {
      await onSave(validSkills)
      onClose()
    } catch (error) {
      console.error('Failed to save skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSkillsList([])
    setNewSkillName('')
    setNewSkillRating(3)
    onClose()
  }

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Beginner',
      2: 'Novice', 
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    }
    return labels[rating] || 'Intermediate'
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Skills"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Add New Skill Section */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Skill</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Customer Service, Sales, Marketing"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={newSkillRating}
                onChange={(e) => setNewSkillRating(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 - Beginner</option>
                <option value={2}>2 - Novice</option>
                <option value={3}>3 - Intermediate</option>
                <option value={4}>4 - Advanced</option>
                <option value={5}>5 - Expert</option>
              </select>
              <Button
                onClick={addSkill}
                disabled={!newSkillName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Current Skills List */}
        <div className="space-y-3">
          {skillsList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-medium mb-2">No skills added yet</p>
              <p className="text-sm">Add your first skill above to get started</p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Skills ({skillsList.length})</h3>
              {skillsList.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={skill.rating}
                          onChange={(e) => updateSkillRating(index, e.target.value)}
                          className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value={1}>1 - Beginner</option>
                          <option value={2}>2 - Novice</option>
                          <option value={3}>3 - Intermediate</option>
                          <option value={4}>4 - Advanced</option>
                          <option value={5}>5 - Expert</option>
                        </select>
                        <button
                          onClick={() => removeSkill(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Remove Skill"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(skill.rating / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{getRatingLabel(skill.rating)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2"
          >
            {loading ? 'Saving...' : 'Save Skills'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default EditSkillsModal