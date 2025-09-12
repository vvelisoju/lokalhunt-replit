import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useAppData } from '../../context/AppDataContext';

const EditSkillsWithExperienceModal = ({ isOpen, onClose, skillsWithExperience = {}, onSave }) => {
  // Use skills from AppDataContext
  const { skills, loading: skillsLoading, fetchSkills } = useAppData();
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [groupedSkills, setGroupedSkills] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load skills from context and group them
  useEffect(() => {
    const processSkills = (skillsData) => {
      if (!Array.isArray(skillsData) || skillsData.length === 0) {
        setGroupedSkills({});
        return;
      }

      const grouped = skillsData.reduce((acc, skill) => {
        const category = skill.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(skill);
        return acc;
      }, {});
      setGroupedSkills(grouped);
    };

    if (isOpen) {
      console.log('EditSkillsWithExperienceModal: Processing skills', {
        skillsLength: skills?.length,
        skillsLoading,
        skills: skills?.slice(0, 3)
      });

      // Process skills if available
      if (Array.isArray(skills) && skills.length > 0) {
        processSkills(skills);
      } else if (!skillsLoading) {
        // Try to fetch skills if not loading
        console.log('EditSkillsWithExperienceModal: Fetching skills...');
        fetchSkills().then(fetchedSkills => {
          if (Array.isArray(fetchedSkills) && fetchedSkills.length > 0) {
            processSkills(fetchedSkills);
          }
        });
      }
    }
  }, [isOpen, skills, skillsLoading, fetchSkills]);

  useEffect(() => {
    if (isOpen) {
      // Convert skillsWithExperience object to array of skill names
      if (skillsWithExperience && typeof skillsWithExperience === 'object') {
        setSelectedSkills(Object.keys(skillsWithExperience));
      } else {
        setSelectedSkills([]);
      }
    }
  }, [isOpen, skillsWithExperience]);

  const handleSkillToggle = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomSkill();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedSkills);
      onClose();
    } catch (error) {
      console.error('Failed to save additional skills:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedSkills([]);
    setCustomSkill('');
    onClose();
  };

  // Get skills to display based on selected category
  const getDisplaySkills = () => {
    if (selectedCategory === 'all') {
      return skills; // Use skills directly from context
    }
    return groupedSkills[selectedCategory] || [];
  };

  // Get available categories
  const getCategories = () => {
    return Object.keys(groupedSkills);
  };

  // Get skill count for category display
  const getSkillCount = (category) => {
    if (category === 'all') {
      return skills.length; // Use skills length from context
    }
    return groupedSkills[category]?.length || 0;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Skills & Experience"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Add Custom Skill Section */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-indigo-600" />
            Add Custom Skill
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., React.js, Project Management"
              className="flex-1 px-2 sm:px-3 py-2 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Button
              onClick={handleAddCustomSkill}
              disabled={!customSkill.trim()}
              className="w-full sm:w-auto px-3 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-sm"
            >
              <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sm:inline">Add</span>
            </Button>
          </div>
        </div>

        {/* Collapsible Category Filter */}
        {(!skillsLoading || (skills && skills.length > 0)) && getCategories().length > 0 && (
          <div className="mb-3 sm:mb-4">
            <button
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              className="flex items-center justify-between w-full p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                Filter: {selectedCategory === "all" ? "All Skills" : selectedCategory}
              </span>
              <div className={`transform transition-transform duration-200 ${showCategoryFilter ? "rotate-180" : ""}`}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {showCategoryFilter && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white border border-gray-100 rounded-lg max-h-40 sm:max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1 sm:gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setShowCategoryFilter(false);
                    }}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors text-left ${
                      selectedCategory === "all"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-50 text-gray-700 border border-transparent hover:bg-blue-50 hover:border-blue-200"
                    }`}
                  >
                    All Skills ({getSkillCount("all")})
                  </button>
                  {getCategories().map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryFilter(false);
                      }}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors text-left ${
                        selectedCategory === category
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-gray-50 text-gray-700 border border-transparent hover:bg-blue-50 hover:border-blue-200"
                      }`}
                    >
                      {category} ({getSkillCount(category)})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills from Context */}
        {skillsLoading && (!skills || skills.length === 0) ? (
          <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading skills...</span>
          </div>
        ) : getDisplaySkills().length > 0 ? (
          <div className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 max-h-72 overflow-y-auto bg-white">
            <div className="flex flex-wrap gap-2">
              {getDisplaySkills().map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillToggle(skill.name)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation ${
                    selectedSkills.includes(skill.name)
                      ? "bg-blue-500 text-white border-2 border-blue-600 shadow-md transform scale-105"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100"
                  }`}
                  title={skill.description || skill.name}
                >
                  {skill.name}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Tap skills to add them to your profile. Selected skills will be highlighted.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">
              {selectedCategory === 'all' ? 'No skills available' : `No ${selectedCategory} skills available`}
            </p>
            <p className="text-sm mb-4">
              {selectedCategory === 'all'
                ? 'Skills are currently being loaded or none are available. You can add custom skills above.'
                : `No skills found in the ${selectedCategory} category. Try selecting a different category or add a custom skill.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Categories
              </button>
            )}
          </div>
        )}

        {/* Selected Skills Display */}
        {selectedSkills.length > 0 && (
          <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-blue-900">
                Selected Skills ({selectedSkills.length})
              </p>
              <button
                onClick={() => setSelectedSkills([])}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors"
                >
                  {skill}
                  <button className="ml-2 text-blue-600 hover:text-blue-800">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 mt-6">
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
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? 'Saving...' : 'Save Skills & Experience'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditSkillsWithExperienceModal;