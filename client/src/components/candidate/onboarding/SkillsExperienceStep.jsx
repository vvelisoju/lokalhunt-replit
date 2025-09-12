import React, { useState, useEffect, useCallback } from "react";
import {
  AcademicCapIcon,
  StarIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import Button from "../../ui/Button";
import { useAppData } from '../../../context/AppDataContext';

const SkillsExperienceStep = ({
  data,
  updateData,
  onNext,
  onBack,
  onSkip,
  stepTitle,
}) => {
  const [customSkill, setCustomSkill] = useState("");
  const [groupedSkills, setGroupedSkills] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const { skills: allSkills, loading: skillsLoading, fetchSkills } = useAppData();

  // Group skills by category and set loading state
  useEffect(() => {
    if (allSkills.length > 0) {
      const grouped = allSkills.reduce((acc, skill) => {
        const category = skill.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(skill);
        return acc;
      }, {});
      setGroupedSkills(grouped);
    } else {
      setGroupedSkills({});
    }
  }, [allSkills]);

  // Ensure skills are loaded from AppDataContext
  useEffect(() => {
    if (allSkills.length === 0 && !skillsLoading) {
      fetchSkills();
    }
  }, [allSkills.length, skillsLoading, fetchSkills]);

  // Get experience level options from enum utility
  const experienceLevelOptions = getExperienceLevelOptions();

  const handleSkillToggle = (skill) => {
    const current = data.skills || [];
    if (current.includes(skill)) {
      updateData({ skills: current.filter((s) => s !== skill) });
    } else {
      updateData({ skills: [...current, skill] });
    }
  };

  const handleAddCustomSkill = () => {
    if (
      customSkill.trim() &&
      !(data.skills || []).includes(customSkill.trim())
    ) {
      updateData({ skills: [...(data.skills || []), customSkill.trim()] });
      setCustomSkill("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddCustomSkill();
    }
  };

  // Get skills to display based on selected category
  const getDisplaySkills = () => {
    if (selectedCategory === "all") {
      return allSkills;
    }
    return groupedSkills[selectedCategory] || [];
  };

  // Get available categories
  const getCategories = () => {
    return Object.keys(groupedSkills);
  };

  // Get skill count for category display
  const getSkillCount = (category) => {
    if (category === "all") {
      return allSkills.length;
    }
    return groupedSkills[category]?.length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{stepTitle}</h2>
        <span className="text-sm text-gray-500 font-medium">3 of 4</span>
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

          {/* Collapsible Category Filter */}
          {!skillsLoading && getCategories().length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  Filter by category ({selectedCategory === "all" ? "All Skills" : selectedCategory})
                </span>
                <div className={`transform transition-transform duration-200 ${showCategoryFilter ? "rotate-180" : ""}`}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showCategoryFilter && (
                <div className="mt-3 p-3 bg-white border-2 border-gray-100 rounded-lg max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setShowCategoryFilter(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                        selectedCategory === "all"
                          ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                          : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-blue-50 hover:border-blue-200"
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
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                          selectedCategory === category
                            ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                            : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-blue-50 hover:border-blue-200"
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

          {/* Skills from API */}
          {skillsLoading ? (
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
                      (data.skills || []).includes(skill.name)
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
                  Showing {getDisplaySkills().length} skills in {selectedCategory === "all" ? "all categories" : selectedCategory}.
                  Tap to select/deselect.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500">
                {selectedCategory === "all"
                  ? "No skills available. Try adding a custom skill above."
                  : `No skills found in ${selectedCategory} category.`}
              </p>
            </div>
          )}

          {/* Selected Skills Display */}
          {data.skills && data.skills.length > 0 && (
            <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-blue-900">
                  Selected Skills ({data.skills.length})
                </p>
                <button
                  onClick={() => updateData({ skills: [] })}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
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
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <StarIcon className="w-4 h-4 inline mr-1" />
            Experience Level
          </label>
          <div className="space-y-3">
            {experienceLevelOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => updateData({ experienceLevel: option.value })}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  data.experienceLevel === option.value
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      data.experienceLevel === option.value
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    }`}
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {option.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expected Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <CurrencyRupeeIcon className="w-4 h-4 inline mr-1" />
            Expected Salary (Monthly)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Minimum (₹)
              </label>
              <input
                type="number"
                placeholder="15,000"
                value={data.expectedSalaryMin || ""}
                onChange={(e) =>
                  updateData({ expectedSalaryMin: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Maximum (₹)
              </label>
              <input
                type="number"
                placeholder="25,000"
                value={data.expectedSalaryMax || ""}
                onChange={(e) =>
                  updateData({ expectedSalaryMax: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base bg-white"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter your expected monthly salary range to help employers find you
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button variant="primary" onClick={onNext} className="flex-1">
            Next Step
          </Button>
        </div>
        <Button variant="outline" onClick={onSkip} className="w-full">
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default SkillsExperienceStep;