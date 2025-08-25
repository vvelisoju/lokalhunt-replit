
import React, { useState } from 'react';
import { AcademicCapIcon, StarIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

const SkillsExperienceStep = ({ data, updateData, onNext, onBack, onSkip, stepTitle }) => {
  const [customSkill, setCustomSkill] = useState('');

  const popularSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML/CSS',
    'SQL', 'Git', 'AWS', 'Docker', 'MongoDB', 'TypeScript',
    'Angular', 'Vue.js', 'PHP', 'C++', 'C#', '.NET',
    'Spring Boot', 'Django', 'Express.js', 'PostgreSQL',
    'Microsoft Office', 'Excel', 'PowerPoint', 'Word',
    'Project Management', 'Agile', 'Scrum', 'Team Leadership',
    'Communication', 'Problem Solving', 'Data Analysis',
    'Digital Marketing', 'SEO', 'Content Writing', 'Social Media'
  ];

  const experienceLevels = [
    { value: 'fresher', label: 'Fresher (0 years)', description: 'Just starting my career' },
    { value: '1-2', label: '1-2 years', description: 'Some professional experience' },
    { value: '3-5', label: '3-5 years', description: 'Experienced professional' },
    { value: '6-10', label: '6-10 years', description: 'Senior professional' },
    { value: '10+', label: '10+ years', description: 'Expert level' }
  ];

  const handleSkillToggle = (skill) => {
    const current = data.skills || [];
    if (current.includes(skill)) {
      updateData({ skills: current.filter(s => s !== skill) });
    } else {
      updateData({ skills: [...current, skill] });
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !(data.skills || []).includes(customSkill.trim())) {
      updateData({ skills: [...(data.skills || []), customSkill.trim()] });
      setCustomSkill('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCustomSkill();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{stepTitle}</h2>
        <span className="text-sm text-gray-500 font-medium">3 of 5</span>
      </div>

      <div className="space-y-6">
        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <AcademicCapIcon className="w-4 h-4 inline mr-1" />
            Your Skills
          </label>
          
          {/* Add Custom Skill */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a custom skill..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Button
              variant="outline"
              onClick={handleAddCustomSkill}
              disabled={!customSkill.trim()}
              className="px-4"
            >
              Add
            </Button>
          </div>

          {/* Popular Skills */}
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {popularSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  (data.skills || []).includes(skill)
                    ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Selected Skills Display */}
          {data.skills && data.skills.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Selected Skills ({data.skills.length}):</p>
              <div className="flex flex-wrap gap-1">
                {data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <StarIcon className="w-4 h-4 inline mr-1" />
            Experience Level
          </label>
          <div className="space-y-3">
            {experienceLevels.map((level) => (
              <div
                key={level.value}
                onClick={() => updateData({ experienceLevel: level.value })}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  data.experienceLevel === level.value
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    data.experienceLevel === level.value
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">{level.label}</div>
                    <div className="text-sm text-gray-500">{level.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            className="flex-1"
          >
            Next Step
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={onSkip}
          className="w-full"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default SkillsExperienceStep;
