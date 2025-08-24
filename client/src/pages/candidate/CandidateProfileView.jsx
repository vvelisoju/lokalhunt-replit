
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CalendarIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const CandidateProfileView = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (candidateId) {
      loadCandidateProfile();
    }
  }, [candidateId]);

  const loadCandidateProfile = async () => {
    setIsLoading(true);
    try {
      // Use different API endpoints based on user role
      let apiUrl = '';
      if (user?.role === 'EMPLOYER') {
        apiUrl = `/api/employer/candidates/${candidateId}/profile`;
      } else if (user?.role === 'BRANCH_ADMIN') {
        apiUrl = `/api/branch-admin/candidates/${candidateId}/profile`;
      } else {
        throw new Error('Unauthorized access');
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load candidate profile');
      }

      const result = await response.json();
      setCandidate(result.data || result);
    } catch (error) {
      console.error('Error loading candidate profile:', error);
      toast.error('Failed to load candidate profile');
      navigate(-1); // Go back if error
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Candidate not found
          </h3>
          <div className="mt-6">
            <Button onClick={handleGoBack}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex-shrink-0">
              <img
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                src={
                  candidate.user?.profileImage ||
                  candidate.profileImage ||
                  `https://ui-avatars.com/api/?name=${candidate.user?.name || candidate.name}&background=1976d2&color=fff&size=128`
                }
                alt={candidate.user?.name || candidate.name || 'Candidate'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {candidate.user?.name || candidate.name || 'Unknown'}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {candidate.currentJobTitle || candidate.jobTitle || 'No job title specified'}
              </p>
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>{candidate.user?.email || candidate.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <PhoneIcon className="h-4 w-4" />
                  <span>{candidate.user?.phone || candidate.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{candidate.currentLocation || candidate.location || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BriefcaseIcon className="h-4 w-4" />
                  <span>{candidate.experience || 0} years experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* About/Bio */}
            {(candidate.bio || candidate.profile_data?.bio) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">
                  {candidate.bio || candidate.profile_data?.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <Badge key={index} variant="primary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {candidate.profile_data?.languages && candidate.profile_data.languages.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.profile_data.languages.map((language, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Experience */}
            {candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5" />
                  Experience
                </h2>
                <div className="space-y-4">
                  {candidate.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <h3 className="font-medium text-gray-900">{exp.position || exp.role}</h3>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                      {exp.description && (
                        <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {candidate.education && Array.isArray(candidate.education) && candidate.education.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="h-5 w-5" />
                  Education
                </h2>
                <div className="space-y-4">
                  {candidate.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-green-200 pl-4">
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.field}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-3 text-sm">
                {candidate.expectedSalary && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Salary:</span>
                    <span className="font-medium">₹{candidate.expectedSalary}</span>
                  </div>
                )}
                {candidate.profile_data?.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium capitalize">{candidate.profile_data.gender}</span>
                  </div>
                )}
                {candidate.profile_data?.dateOfBirth && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">{new Date(candidate.profile_data.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
                {candidate.user?.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">{new Date(candidate.user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileView;
