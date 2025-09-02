import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  StarIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { getAd } from "../../services/employer/ads";
import { toast } from "react-hot-toast";
import Loading from "../../components/ui/Loading";

const AdCandidates = () => {
  const { adId } = useParams();
  const [ad, setAd] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdAndCandidates();
  }, [adId]);

  const loadAdAndCandidates = async () => {
    setIsLoading(true);
    try {
      const result = await getAd(adId);
      if (result.success) {
        setAd(result.data);
        setCandidates(result.data.allocations || []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to load ad candidates");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ALLOCATED":
        return "bg-blue-100 text-blue-800";
      case "INTERVIEWED":
        return "bg-purple-100 text-purple-800";
      case "SELECTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />,
      );
    }

    return stars;
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!ad) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ad not found</h3>
        <Link to="/employer/ads" className="text-blue-600 hover:text-blue-500">
          Back to Ads
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/employer/ads"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Ads
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{ad.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{ad.company?.name}</span>
            <span>•</span>
            <span>{ad.location?.name || ad.city}</span>
            <span>•</span>
            <span>{ad.employmentType}</span>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Allocated Candidates ({candidates.length})
          </h2>
        </div>

        {candidates.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {candidates.map((allocation) => {
              const candidate = allocation.candidate;
              const user = candidate?.user;

              return (
                <div key={allocation.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {user?.name || "Anonymous Candidate"}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(allocation.status)}`}
                          >
                            {allocation.status}
                          </span>
                        </div>

                        {candidate?.overallRating && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-600">
                              Rating:
                            </span>
                            <div className="flex items-center space-x-1">
                              {renderStars(candidate.overallRating)}
                              <span className="text-sm text-gray-600 ml-2">
                                ({candidate.overallRating.toFixed(1)})
                              </span>
                            </div>
                          </div>
                        )}

                        {candidate?.tags && candidate.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {candidate.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {user?.email && (
                        <a
                          href={`mailto:${user.email}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          Contact
                        </a>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement view profile functionality
                          toast.info("Profile view coming soon");
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No candidates allocated
            </h3>
            <p className="text-gray-600">
              Candidates will appear here once the Branch Admin allocates them
              to this job posting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdCandidates;
