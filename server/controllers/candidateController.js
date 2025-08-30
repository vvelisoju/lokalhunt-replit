const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createResponse, createErrorResponse } = require("../utils/response");
const { ObjectStorageService } = require("../objectStorage");
const { generateCandidateAbout } = require("./aiController");

class CandidateController {
  // =======================
  // PROFILE MANAGEMENT
  // =======================

  // Get complete candidate profile
  async getProfile(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true, // Changed from city to cityId
              isActive: true,
              createdAt: true,
              city: {
                // Added city to include city details
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Build jobPreferences from dedicated candidate columns for frontend compatibility
      const profileData = candidate.profileData || {};
      const jobPreferences = {
        jobTitles: candidate.preferredJobTitles || [],
        preferredRoles: candidate.preferredJobTitles || [],
        industry: candidate.preferredIndustries || [],
        locations: candidate.preferredLocations || [],
        preferredLocations: candidate.preferredLocations || [],
        jobTypes: candidate.preferredJobTypes || [],
        languages: candidate.preferredLanguages || [],
        workType: candidate.remoteWorkPreference,
        remoteWork: candidate.remoteWorkPreference,
        currentEmploymentStatus: candidate.currentEmploymentStatus,
        shiftPreference: candidate.shiftPreference,
        travelWillingness: candidate.travelWillingness,
        noticePeriod: candidate.noticePeriod,
        experienceLevel: candidate.experienceLevel,
        salaryRange: {
          min: candidate.preferredSalaryMin ? Number(candidate.preferredSalaryMin) : null,
          max: candidate.preferredSalaryMax ? Number(candidate.preferredSalaryMax) : null,
        },
        availability: candidate.availabilityStatus || candidate.availabilityDate || profileData.availabilityPreference,
      };

      const enhancedCandidate = {
        ...candidate,
        jobPreferences,
        // Explicitly include these fields at the top level for better accessibility
        experienceLevel: candidate.experienceLevel,
        availabilityStatus: candidate.availabilityStatus,
        openToWork: profileData.openToWork || false,
      };

      res.json(
        createResponse("Profile retrieved successfully", enhancedCandidate),
      );
    } catch (error) {
      next(error);
    }
  }

  // Update candidate profile
  async updateProfile(req, res, next) {
    try {
      const {
        profileData,
        resumeUrl,
        education,
        experience,
        portfolio,
        profilePhoto,
        dateOfBirth,
        skills,
        jobPreferences,
        ratings,
        firstName,
        lastName,
        email,
        phone,
        openToWork,
        coverPhoto,
        cityId,
      } = req.body;

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Prepare update data - only include fields that are provided
      const updateData = {};

      if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
      if (education !== undefined) updateData.education = education;
      if (experience !== undefined) updateData.experience = experience;
      if (portfolio !== undefined) updateData.portfolio = portfolio;
      if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
      if (coverPhoto !== undefined) updateData.coverPhoto = coverPhoto;
      if (dateOfBirth !== undefined)
        updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;

      // Handle skills - convert skills array to ratings object for Prisma schema
      if (skills !== undefined) {
        const ratingsObj = {};
        skills.forEach((skill) => {
          ratingsObj[skill.name] = skill.rating;
        });
        updateData.ratings = ratingsObj;
      } else if (ratings !== undefined) {
        updateData.ratings = ratings;
      }

      // Handle skillsWithExperience - store directly in the candidate record
      if (req.body.skillsWithExperience !== undefined) {
        updateData.skillsWithExperience = req.body.skillsWithExperience;
      }

      // Handle job preferences - map to dedicated candidate columns
      if (jobPreferences !== undefined) {
        // Map to dedicated candidate columns
        if (jobPreferences.jobTitles !== undefined) updateData.preferredJobTitles = jobPreferences.jobTitles;
        if (jobPreferences.preferredRoles !== undefined) updateData.preferredJobTitles = jobPreferences.preferredRoles;
        if (jobPreferences.industry !== undefined) updateData.preferredIndustries = jobPreferences.industry;
        if (jobPreferences.locations !== undefined) updateData.preferredLocations = jobPreferences.locations;
        if (jobPreferences.preferredLocations !== undefined) updateData.preferredLocations = jobPreferences.preferredLocations;
        if (jobPreferences.remoteWork !== undefined) updateData.remoteWorkPreference = jobPreferences.remoteWork;
        if (jobPreferences.workType !== undefined) updateData.remoteWorkPreference = jobPreferences.workType;
        if (jobPreferences.currentEmploymentStatus !== undefined) updateData.currentEmploymentStatus = jobPreferences.currentEmploymentStatus;
        if (jobPreferences.shiftPreference !== undefined) updateData.shiftPreference = jobPreferences.shiftPreference;
        if (jobPreferences.travelWillingness !== undefined) updateData.travelWillingness = jobPreferences.travelWillingness;
        if (jobPreferences.jobTypes !== undefined) updateData.preferredJobTypes = jobPreferences.jobTypes;
        if (jobPreferences.languages !== undefined) updateData.preferredLanguages = jobPreferences.languages;
        if (jobPreferences.noticePeriod !== undefined) updateData.noticePeriod = jobPreferences.noticePeriod;
        
        // Handle salary range
        if (jobPreferences.salaryRange !== undefined) {
          if (jobPreferences.salaryRange.min !== undefined) {
            updateData.preferredSalaryMin = jobPreferences.salaryRange.min;
          }
          if (jobPreferences.salaryRange.max !== undefined) {
            updateData.preferredSalaryMax = jobPreferences.salaryRange.max;
          }
        }

        // Handle experience level
        if (jobPreferences.experienceLevel !== undefined) {
          updateData.experienceLevel = jobPreferences.experienceLevel;
        }

        // Handle availability - prefer availabilityStatus for enum values, availabilityDate for actual dates
        if (jobPreferences.availability !== undefined) {
          const availabilityValue = jobPreferences.availability;
          if (availabilityValue === null || availabilityValue === undefined) {
            updateData.availabilityDate = null;
            updateData.availabilityStatus = null;
          } else if (typeof availabilityValue === 'string' && 
                     ['IMMEDIATELY', 'WITHIN_1_WEEK', 'WITHIN_1_MONTH', 'AFTER_2_MONTHS'].includes(availabilityValue)) {
            // For enum values, store in availabilityStatus
            updateData.availabilityStatus = availabilityValue;
            updateData.availabilityDate = null;
          } else {
            // Try to parse as date only if it's a valid date string
            const parsedDate = new Date(availabilityValue);
            if (!isNaN(parsedDate.getTime())) {
              updateData.availabilityDate = parsedDate;
              updateData.availabilityStatus = null;
            } else {
              updateData.availabilityStatus = availabilityValue;
              updateData.availabilityDate = null;
            }
          }
        }
      }

      // Handle profileData - only keep summary, headline, and availabilityPreference
      if (profileData !== undefined) {
        const currentProfileData = candidate.profileData || {};
        const cleanProfileData = {};
        
        // Only keep allowed fields in profileData
        if (profileData.summary !== undefined) cleanProfileData.summary = profileData.summary;
        if (profileData.headline !== undefined) cleanProfileData.headline = profileData.headline;
        if (profileData.availabilityPreference !== undefined) cleanProfileData.availabilityPreference = profileData.availabilityPreference;
        
        // Handle availability preference from jobPreferences
        if (jobPreferences?.availability && 
            ['IMMEDIATELY', 'WITHIN_1_WEEK', 'WITHIN_1_MONTH', 'AFTER_2_MONTHS'].includes(jobPreferences.availability)) {
          cleanProfileData.availabilityPreference = jobPreferences.availability;
        }

        updateData.profileData = cleanProfileData;
      }

      if (openToWork !== undefined) {
        const currentProfileData = updateData.profileData || candidate.profileData || {};
        updateData.profileData = {
          ...currentProfileData,
          openToWork,
        };
      }

      // Update user data if provided
      const userUpdateData = {};
      if (firstName !== undefined) userUpdateData.firstName = firstName;
      if (lastName !== undefined) userUpdateData.lastName = lastName;
      if (email !== undefined) userUpdateData.email = email;
      if (phone !== undefined) userUpdateData.phone = phone;
      if (cityId !== undefined) userUpdateData.cityId = cityId; // Added cityId update

      // Update user if there are user fields to update
      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: userUpdateData,
        });
      }

      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true, // Changed from city to cityId
              city: {
                // Added city to include city details
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      // Extract jobPreferences from profileData for frontend compatibility (same as getProfile)
      const candidateProfileData = updatedCandidate.profileData || {};
      const enhancedUpdatedCandidate = {
        ...updatedCandidate,
        jobPreferences: candidateProfileData.jobPreferences || null,
        openToWork: candidateProfileData.openToWork || false,
      };

      res.json(
        createResponse(
          "Profile updated successfully",
          enhancedUpdatedCandidate,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // Get candidate dashboard
  async getDashboard(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        include: {
          user: {
            include: { city: true }, // Changed from city to city
          },
          allocations: {
            include: {
              ad: {
                include: {
                  company: true,
                  location: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          bookmarks: {
            include: {
              ad: {
                include: {
                  company: true,
                  location: true,
                },
              },
            },
          },
        },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Calculate profile completeness
      const profileFields = [
        candidate.profileData,
        candidate.resumeUrl,
        candidate.education,
        candidate.experience,
        candidate.profilePhoto,
        candidate.dateOfBirth,
      ];
      const completedFields = profileFields.filter(
        (field) => field !== null && field !== undefined,
      ).length;
      const profileCompleteness = Math.round(
        (completedFields / profileFields.length) * 100,
      );

      // Application statistics
      const applicationStats = {
        total: candidate.allocations.length,
        applied: candidate.allocations.filter((a) => a.status === "APPLIED")
          .length,
        screened: candidate.allocations.filter(
          (a) => a.status === "SHORTLISTED",
        ).length,
        allocated: candidate.allocations.filter((a) => a.status === "APPLIED")
          .length,
        shortlisted: candidate.allocations.filter(
          (a) => a.status === "SHORTLISTED",
        ).length,
        hired: candidate.allocations.filter((a) => a.status === "HIRED").length,
        rejected: candidate.allocations.filter((a) => a.status === "REJECTED")
          .length,
      };

      const dashboardData = {
        candidate,
        profileCompleteness,
        applicationStats,
        recentApplications: candidate.allocations.slice(0, 5),
        bookmarkCount: candidate.bookmarks.length,
      };

      res.json(
        createResponse("Dashboard data retrieved successfully", dashboardData),
      );
    } catch (error) {
      next(error);
    }
  }

  // Apply to job
  async applyToJob(req, res, next) {
    try {
      const { adId } = req.params;
      const { notes } = req.body;

      // Check if candidate exists
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Check if ad exists and is approved
      const ad = await prisma.ad.findFirst({
        where: {
          id: adId,
          status: "APPROVED",
          isActive: true,
        },
        include: { employer: true },
      });

      if (!ad) {
        return res
          .status(404)
          .json(
            createErrorResponse("Job posting not found or not available", 404),
          );
      }

      // Check if already applied
      const existingApplication = await prisma.allocation.findFirst({
        where: {
          candidateId: candidate.id,
          adId: adId,
        },
      });

      if (existingApplication) {
        return res
          .status(409)
          .json(
            createErrorResponse("You have already applied to this job", 409),
          );
      }

      // Create application
      const application = await prisma.allocation.create({
        data: {
          candidateId: candidate.id,
          adId: adId,
          employerId: ad.employerId,
          notes,
        },
        include: {
          ad: {
            include: {
              company: true,
              location: true,
            },
          },
        },
      });

      res
        .status(201)
        .json(
          createResponse("Application submitted successfully", application),
        );
    } catch (error) {
      next(error);
    }
  }

  // Get applications
  async getApplications(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const where = {
        candidateId: candidate.id,
        ...(status && { status }),
      };

      const [applications, total] = await Promise.all([
        prisma.allocation.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            ad: {
              include: {
                company: true,
                location: true,
                _count: {
                  select: { allocations: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.allocation.count({ where }),
      ]);

      // Transform applications to include candidate count
      const applicationsWithCount = applications.map((application) => ({
        ...application,
        ad: {
          ...application.ad,
          candidatesCount: application.ad?._count?.allocations || 0,
        },
      }));

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(
        createResponse(
          "Applications retrieved successfully",
          applicationsWithCount,
          pagination,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // Bookmark/unbookmark job
  async toggleBookmark(req, res, next) {
    try {
      const { adId } = req.params;

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Check if bookmark exists
      const existingBookmark = await prisma.bookmark.findUnique({
        where: {
          candidateId_adId: {
            candidateId: candidate.id,
            adId: adId,
          },
        },
      });

      if (existingBookmark) {
        // Remove bookmark
        await prisma.bookmark.delete({
          where: { id: existingBookmark.id },
        });
        res.json(
          createResponse("Bookmark removed successfully", {
            bookmarked: false,
          }),
        );
      } else {
        // Add bookmark
        await prisma.bookmark.create({
          data: {
            candidateId: candidate.id,
            adId: adId,
          },
        });
        res.json(
          createResponse("Job bookmarked successfully", { bookmarked: true }),
        );
      }
    } catch (error) {
      next(error);
    }
  }

  // Get bookmarks
  async getBookmarks(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const [bookmarks, total] = await Promise.all([
        prisma.bookmark.findMany({
          where: { candidateId: candidate.id },
          skip,
          take: parseInt(limit),
          include: {
            ad: {
              include: {
                company: true,
                location: true,
                _count: {
                  select: {
                    allocations: true,
                    bookmarks: true
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.bookmark.count({ where: { candidateId: candidate.id } }),
      ]);

      // Check application status for each bookmarked job and include counts
      const bookmarksWithStatus = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const application = await prisma.allocation.findFirst({
            where: {
              candidateId: candidate.id,
              adId: bookmark.ad.id,
            },
          });

          return {
            ...bookmark,
            hasApplied: !!application,
            ad: {
              ...bookmark.ad,
              candidatesCount: bookmark.ad?._count?.allocations || 0,
              applicationCount: bookmark.ad?._count?.allocations || 0,
              bookmarkedCount: bookmark.ad?._count?.bookmarks || 0,
            },
          };
        }),
      );

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      };

      res.json(
        createResponse(
          "Bookmarks retrieved successfully",
          bookmarksWithStatus,
          pagination,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // Update specific profile sections
  async updateBasicInfo(req, res, next) {
    try {
      const { name, phone, dateOfBirth, profileData } = req.body;

      const [updatedUser, updatedCandidate] = await Promise.all([
        prisma.user.update({
          where: { id: req.user.userId },
          data: {
            ...(name && { name }),
            ...(phone && { phone }),
          },
        }),
        prisma.candidate.update({
          where: { userId: req.user.userId },
          data: {
            ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
            ...(profileData && { profileData }),
          },
        }),
      ]);

      res.json(
        createResponse("Basic information updated successfully", {
          user: updatedUser,
          candidate: updatedCandidate,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateExperience(req, res, next) {
    try {
      const { experience } = req.body;

      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: { experience },
      });

      res.json(
        createResponse("Experience updated successfully", updatedCandidate),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateEducation(req, res, next) {
    try {
      const { education } = req.body;

      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: { education },
      });

      res.json(
        createResponse("Education updated successfully", updatedCandidate),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateSkills(req, res, next) {
    try {
      const { tags } = req.body;

      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: { tags },
      });

      res.json(createResponse("Skills updated successfully", updatedCandidate));
    } catch (error) {
      next(error);
    }
  }

  // Profile photo management
  async uploadProfilePhoto(req, res, next) {
    try {
      const { profilePhoto } = req.body;

      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: { profilePhoto },
      });

      res.json(
        createResponse("Profile photo uploaded successfully", {
          profilePhoto: updatedCandidate.profilePhoto,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async removeProfilePhoto(req, res, next) {
    try {
      await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: { profilePhoto: null },
      });

      res.json(createResponse("Profile photo removed successfully"));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // RESUME MANAGEMENT
  // =======================

  async uploadResume(req, res, next) {
    try {
      const { resumeUrl, fileName, fileSize } = req.body;

      if (!resumeUrl) {
        return res
          .status(400)
          .json(createErrorResponse("Resume URL is required", 400));
      }

      const objectStorageService = new ObjectStorageService();

      // Get current candidate to check for existing resume
      const currentCandidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        select: { resumeUrl: true, profileData: true },
      });

      // Delete old resume if it exists
      if (currentCandidate?.resumeUrl) {
        const oldFilePath = objectStorageService.extractFilePathFromUrl(currentCandidate.resumeUrl);
        if (oldFilePath) {
          console.log(`🗑️  Deleting old resume: ${oldFilePath}`);
          await objectStorageService.deleteFile(oldFilePath);
        }
      }

      // Extract the file path from the Google Cloud Storage URL
      const filePath = objectStorageService.extractFilePathFromUrl(resumeUrl);

      // Create server URL for serving the resume
      const serverResumeUrl = `/api/public/files/${filePath}`;
      console.log("Storing server resume URL:", serverResumeUrl);

      // Store resume metadata in profileData
      const currentProfileData = currentCandidate?.profileData || {};
      const updatedProfileData = {
        ...currentProfileData,
        resumeMetadata: {
          fileName: fileName || "resume.pdf",
          fileSize: fileSize || 0,
          uploadedAt: new Date().toISOString(),
          originalUrl: resumeUrl
        }
      };

      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: { 
          resumeUrl: serverResumeUrl,
          profileData: updatedProfileData
        },
      });

      // Return resume data in the format expected by frontend
      const resumeData = {
        url: serverResumeUrl,
        fileName: fileName || "resume.pdf",
        fileSize: fileSize || 0,
        uploadedAt: new Date().toISOString(),
      };

      console.log("Resume uploaded with metadata:", resumeData);
      res.json(createResponse("Resume uploaded successfully", resumeData));
    } catch (error) {
      console.error("Upload resume error:", error);
      next(error);
    }
  }

  async getResume(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        select: { resumeUrl: true, updatedAt: true, profileData: true },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Check if resume URL is valid (not null, not empty, not 'null' string)
      const isValidResumeUrl = candidate.resumeUrl && 
                              candidate.resumeUrl !== 'null' && 
                              candidate.resumeUrl.trim().length > 0;

      if (!isValidResumeUrl) {
        // Clean up invalid resume URL if it exists
        if (candidate.resumeUrl) {
          await prisma.candidate.update({
            where: { userId: req.user.userId },
            data: { 
              resumeUrl: null,
              profileData: {
                ...(candidate.profileData || {}),
                resumeMetadata: null
              }
            },
          });
        }

        // Return a success response with null data instead of 404 for better UX
        return res.json(
          createResponse("No resume uploaded yet", {
            url: null,
            fileName: null,
            fileSize: 0,
            uploadedAt: null,
          })
        );
      }

      // Get resume metadata from profileData
      const resumeMetadata = candidate.profileData?.resumeMetadata || {};

      // If we have stored metadata, use it, otherwise try to get file size from storage
      let fileSize = resumeMetadata.fileSize || 0;
      let fileName = resumeMetadata.fileName || "resume.pdf";
      let uploadedAt = resumeMetadata.uploadedAt || candidate.updatedAt.toISOString();

      // If no file size in metadata, try to get it from object storage
      if (fileSize === 0 && candidate.resumeUrl) {
        try {
          const objectStorageService = new ObjectStorageService();

          // Extract the actual storage path from the server URL
          let filePath = null;
          if (candidate.resumeUrl.includes('/api/public/files/')) {
            // Extract the path after /api/public/files/
            filePath = candidate.resumeUrl.split('/api/public/files/')[1];
          } else {
            filePath = objectStorageService.extractFilePathFromUrl(candidate.resumeUrl);
          }

          console.log("Trying to get file size for path:", filePath);

          if (filePath) {
            const file = objectStorageService.bucket.file(filePath);
            const [exists] = await file.exists();

            if (exists) {
              const [metadata] = await file.getMetadata();
              fileSize = metadata.size || 0;
              console.log("Got file size from storage:", fileSize);

              // Update the stored metadata with the real file size
              if (fileSize > 0) {
                const updatedProfileData = {
                  ...(candidate.profileData || {}),
                  resumeMetadata: {
                    ...resumeMetadata,
                    fileSize: fileSize
                  }
                };

                await prisma.candidate.update({
                  where: { userId: req.user.userId },
                  data: { profileData: updatedProfileData },
                });
              }
            } else {
              console.log("File does not exist in storage:", filePath);
            }
          }
        } catch (error) {
          console.log("Could not fetch file size from storage:", error.message);
        }
      }

      const resumeData = {
        url: candidate.resumeUrl,
        fileName: fileName,
        fileSize: fileSize,
        uploadedAt: uploadedAt,
      };

      console.log("Retrieved resume data:", resumeData);
      res.json(createResponse("Resume retrieved successfully", resumeData));
    } catch (error) {
      console.error("Get resume error:", error);
      next(error);
    }
  }

  async deleteResume(req, res, next) {
    try {
      await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: { resumeUrl: null },
      });

      res.json(createResponse("Resume deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  async updateResumeStatus(req, res, next) {
    try {
      const { status } = req.body;

      if (!status || !["ACTIVE", "INACTIVE", "PENDING"].includes(status)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Valid status is required (ACTIVE, INACTIVE, PENDING)",
              400,
            ),
          );
      }

      // For now, we'll just acknowledge the status update since we don't have a status field in the schema
      // This could be extended to update a resumeStatus field if added to the schema
      res.json(
        createResponse("Resume status updated successfully", { status }),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // ONBOARDING MANAGEMENT
  // =======================

  async saveOnboardingData(req, res, next) {
    try {
      const {
        step,
        basicInfo,
        jobPreferences,
        skillsExperience,
        isCompleted = false
      } = req.body;

      console.log("Saving onboarding data for user:", req.user.userId);
      console.log("Onboarding data:", { step, basicInfo, jobPreferences, skillsExperience, isCompleted });

      // Get or create candidate profile
      let candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      if (!candidate) {
        // Create candidate profile if it doesn't exist
        candidate = await prisma.candidate.create({
          data: {
            userId: req.user.userId,
            onboardingStep: step || 0,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                cityId: true,
                city: {
                  select: {
                    id: true,
                    name: true,
                    state: true,
                  },
                },
              },
            },
          },
        });
      }

      // Prepare update data
      const updateData = {
        onboardingStep: step || candidate.onboardingStep,
        onboardingCompleted: isCompleted,
      };

      // Update user data if basicInfo is provided
      const userUpdateData = {};
      if (basicInfo) {
        if (basicInfo.firstName !== undefined) userUpdateData.firstName = basicInfo.firstName;
        if (basicInfo.lastName !== undefined) userUpdateData.lastName = basicInfo.lastName;
        if (basicInfo.phone !== undefined) userUpdateData.phone = basicInfo.phone;
        if (basicInfo.cityId !== undefined) userUpdateData.cityId = basicInfo.cityId;
      }

      // Update candidate data from basicInfo
      if (basicInfo) {
        if (basicInfo.dateOfBirth !== undefined) {
          updateData.dateOfBirth = basicInfo.dateOfBirth ? new Date(basicInfo.dateOfBirth) : null;
        }
        if (basicInfo.bio !== undefined) updateData.bio = basicInfo.bio;
        if (basicInfo.linkedinUrl !== undefined) updateData.linkedinUrl = basicInfo.linkedinUrl;
        if (basicInfo.githubUrl !== undefined) updateData.githubUrl = basicInfo.githubUrl;
        if (basicInfo.websiteUrl !== undefined) updateData.websiteUrl = basicInfo.websiteUrl;
        if (basicInfo.profilePhoto !== undefined) updateData.profilePhoto = basicInfo.profilePhoto;
        if (basicInfo.coverPhoto !== undefined) updateData.coverPhoto = basicInfo.coverPhoto;
      }

      // Update candidate data from jobPreferences - map to respective columns
      if (jobPreferences) {
        // Map to candidate table columns
        if (jobPreferences.jobTitles !== undefined) updateData.preferredJobTitles = jobPreferences.jobTitles;
        if (jobPreferences.industry !== undefined) updateData.preferredIndustries = jobPreferences.industry;
        if (jobPreferences.locations !== undefined) updateData.preferredLocations = jobPreferences.locations;
        if (jobPreferences.preferredLocations !== undefined) updateData.preferredLocations = jobPreferences.preferredLocations;
        if (jobPreferences.salaryRange !== undefined) {
          if (jobPreferences.salaryRange.min !== undefined) {
            updateData.preferredSalaryMin = jobPreferences.salaryRange.min;
          }
          if (jobPreferences.salaryRange.max !== undefined) {
            updateData.preferredSalaryMax = jobPreferences.salaryRange.max;
          }
        }
        if (jobPreferences.jobTypes !== undefined) updateData.preferredJobTypes = jobPreferences.jobTypes;
        if (jobPreferences.remoteWork !== undefined) updateData.remoteWorkPreference = jobPreferences.remoteWork;
        if (jobPreferences.workType !== undefined) updateData.remoteWorkPreference = jobPreferences.workType;
        if (jobPreferences.languages !== undefined) updateData.preferredLanguages = jobPreferences.languages;
        if (jobPreferences.shiftPreference !== undefined) updateData.shiftPreference = jobPreferences.shiftPreference;
        if (jobPreferences.travelWillingness !== undefined) updateData.travelWillingness = jobPreferences.travelWillingness;
        if (jobPreferences.currentEmploymentStatus !== undefined) updateData.currentEmploymentStatus = jobPreferences.currentEmploymentStatus;
      }

      // Update candidate data from skillsExperience - map to respective columns
      if (skillsExperience) {
        // Map skills to skillsWithExperience column
        if (skillsExperience.skills !== undefined) {
          const skillsWithExp = {};
          skillsExperience.skills.forEach(skill => {
            skillsWithExp[skill.id || skill.name] = skill.experience || skill.level || 'ENTRY_LEVEL';
          });
          updateData.skillsWithExperience = skillsWithExp;
        }

        // Map to candidate table columns
        if (skillsExperience.currentEmploymentStatus !== undefined) {
          updateData.currentEmploymentStatus = skillsExperience.currentEmploymentStatus;
        }
        
        // Map experience level
        if (skillsExperience.experienceLevel !== undefined) {
          updateData.experienceLevel = skillsExperience.experienceLevel;
        }
        
        // Handle availability - prefer availabilityStatus for enum values, availabilityDate for actual dates
        if (skillsExperience.availabilityDate !== undefined) {
          const availabilityValue = skillsExperience.availabilityDate;
          if (availabilityValue === null || availabilityValue === undefined) {
            updateData.availabilityDate = null;
            updateData.availabilityStatus = null;
          } else if (typeof availabilityValue === 'string' && 
                     ['IMMEDIATELY', 'WITHIN_1_WEEK', 'WITHIN_1_MONTH', 'AFTER_2_MONTHS'].includes(availabilityValue)) {
            // For enum values, store in availabilityStatus
            updateData.availabilityStatus = availabilityValue;
            updateData.availabilityDate = null;
          } else {
            // Try to parse as date only if it's a valid date string
            const parsedDate = new Date(availabilityValue);
            if (!isNaN(parsedDate.getTime())) {
              updateData.availabilityDate = parsedDate;
              updateData.availabilityStatus = null;
            } else {
              updateData.availabilityStatus = availabilityValue;
              updateData.availabilityDate = null;
            }
          }
        }
        if (skillsExperience.noticePeriod !== undefined) updateData.noticePeriod = skillsExperience.noticePeriod;
        if (skillsExperience.currentSalary !== undefined) updateData.currentSalary = skillsExperience.currentSalary;

        // Update experience and education arrays
        if (skillsExperience.experience !== undefined) updateData.experience = skillsExperience.experience;
        if (skillsExperience.education !== undefined) updateData.education = skillsExperience.education;
      }

      // Generate profileData with headline and summary if this is completion or if we have job preferences
      if ((isCompleted || jobPreferences) && (jobPreferences || skillsExperience)) {
        const currentProfileData = updateData.profileData || candidate.profileData || {};

        // Generate headline from job roles (top 2 only) as a normal string
        let headline = '';
        if (jobPreferences?.jobTitles && jobPreferences.jobTitles.length > 0) {
          const topTwoRoles = jobPreferences.jobTitles.slice(0, 2);
          headline = topTwoRoles.join(' | ');
        }

        // Generate AI-powered summary using the dedicated method
        let summary = '';
        if (jobPreferences || skillsExperience || basicInfo) {
          const preferencesForAI = {
            jobTitles: jobPreferences?.jobTitles || [],
            industry: jobPreferences?.industry || [],
            jobTypes: jobPreferences?.jobTypes || [],
            experienceLevel: skillsExperience?.experienceLevel || '',
            skills: skillsExperience?.skills || [],
            languages: jobPreferences?.languages || [],
            currentEmploymentStatus: skillsExperience?.currentEmploymentStatus || basicInfo?.currentEmploymentStatus || '',
            shiftPreference: jobPreferences?.shiftPreference || '',
            location: basicInfo?.city || 'Various locations',
            salaryExpectation: jobPreferences?.salaryRange ? {
              min: jobPreferences.salaryRange.min,
              max: jobPreferences.salaryRange.max
            } : null
          };

          try {
            summary = await generateCandidateAbout(preferencesForAI);
            console.log('Generated AI summary for candidate:', req.user.userId);
          } catch (error) {
            console.error('Failed to generate AI summary:', error);
            // Fallback to a basic summary if AI fails
            summary = headline ? `Experienced ${headline} looking for new opportunities.` : '';
          }
        }

        // Update profileData with generated content and only unsupported fields
        const cleanProfileData = {
          ...currentProfileData,
          ...(headline && { headline }),
          ...(summary && { summary }),
          // Store any unsupported fields from skillsExperience
          ...(skillsExperience && {
            additionalInfo: skillsExperience.additionalInfo,
            portfolioUrl: skillsExperience.portfolioUrl,
            certifications: skillsExperience.certifications
          })
        };

        // Only store job preferences fields that don't have dedicated columns
        if (jobPreferences) {
          const unsupportedJobPrefs = {};
          
          // Only keep fields that don't have dedicated candidate columns
          if (jobPreferences.workEnvironmentPreference !== undefined) {
            unsupportedJobPrefs.workEnvironmentPreference = jobPreferences.workEnvironmentPreference;
          }
          if (jobPreferences.careerGoals !== undefined) {
            unsupportedJobPrefs.careerGoals = jobPreferences.careerGoals;
          }
          if (jobPreferences.benefits !== undefined) {
            unsupportedJobPrefs.benefits = jobPreferences.benefits;
          }
          if (jobPreferences.companySize !== undefined) {
            unsupportedJobPrefs.companySize = jobPreferences.companySize;
          }

          // Only add jobPreferences to profileData if there are unsupported fields
          if (Object.keys(unsupportedJobPrefs).length > 0) {
            cleanProfileData.jobPreferences = {
              ...(currentProfileData.jobPreferences || {}),
              ...unsupportedJobPrefs
            };
          }
        }

        updateData.profileData = cleanProfileData;
      }

      // Update user if there are user fields to update
      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: userUpdateData,
        });
      }

      // Update candidate
      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      // Prepare response data
      const responseData = {
        candidate: updatedCandidate,
        onboardingProgress: {
          currentStep: updatedCandidate.onboardingStep,
          isCompleted: updatedCandidate.onboardingCompleted,
          completedSteps: updatedCandidate.onboardingStep || 0,
        }
      };

      res.json(
        createResponse("Onboarding data saved successfully", responseData),
      );
    } catch (error) {
      console.error("Save onboarding data error:", error);
      next(error);
    }
  }

  async getOnboardingData(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      if (!candidate) {
        // Return default onboarding data if candidate doesn't exist
        return res.json(
          createResponse("Onboarding data retrieved successfully", {
            basicInfo: {},
            jobPreferences: {},
            skillsExperience: {},
            onboardingProgress: {
              currentStep: 0,
              isCompleted: false,
              completedSteps: 0,
            }
          })
        );
      }

      // Build onboarding data from candidate record - read from respective columns
      const profileData = candidate.profileData || {};

      const onboardingData = {
        basicInfo: {
          firstName: candidate.user.firstName,
          lastName: candidate.user.lastName,
          phone: candidate.user.phone,
          cityId: candidate.user.cityId,
          city: candidate.user.city,
          dateOfBirth: candidate.dateOfBirth,
          bio: candidate.bio,
          linkedinUrl: candidate.linkedinUrl,
          githubUrl: candidate.githubUrl,
          websiteUrl: candidate.websiteUrl,
          profilePhoto: candidate.profilePhoto,
          coverPhoto: candidate.coverPhoto,
          currentEmploymentStatus: candidate.currentEmploymentStatus,
        },
        jobPreferences: {
          // Read from dedicated candidate columns
          jobTitles: candidate.preferredJobTitles || [],
          preferredRoles: candidate.preferredJobTitles || [],
          industry: candidate.preferredIndustries || [],
          locations: candidate.preferredLocations || [],
          preferredLocations: candidate.preferredLocations || [],
          salaryRange: {
            min: candidate.preferredSalaryMin ? Number(candidate.preferredSalaryMin) : null,
            max: candidate.preferredSalaryMax ? Number(candidate.preferredSalaryMax) : null,
          },
          jobTypes: candidate.preferredJobTypes || [],
          remoteWork: candidate.remoteWorkPreference,
          workType: candidate.remoteWorkPreference,
          languages: candidate.preferredLanguages || [],
          shiftPreference: candidate.shiftPreference,
          travelWillingness: candidate.travelWillingness,
          currentEmploymentStatus: candidate.currentEmploymentStatus,
          noticePeriod: candidate.noticePeriod,
          availability: candidate.availabilityStatus || candidate.availabilityDate || profileData.availabilityPreference,
          experienceLevel: candidate.experienceLevel,
        },
        skillsExperience: {
          // Read from dedicated candidate columns
          skills: candidate.skillsWithExperience || {},
          currentEmploymentStatus: candidate.currentEmploymentStatus,
          experienceLevel: candidate.experienceLevel,
          availabilityDate: candidate.availabilityStatus || candidate.availabilityDate || profileData.availabilityPreference,
          noticePeriod: candidate.noticePeriod,
          currentSalary: candidate.currentSalary ? Number(candidate.currentSalary) : null,
          experience: candidate.experience || [],
          education: candidate.education || [],
          // Include any additional fields from profileData
          additionalInfo: profileData.additionalInfo,
          portfolioUrl: profileData.portfolioUrl,
          certifications: profileData.certifications,
        },
        onboardingProgress: {
          currentStep: candidate.onboardingStep || 0,
          isCompleted: candidate.onboardingCompleted,
          completedSteps: candidate.onboardingStep || 0,
        }
      };

      res.json(
        createResponse("Onboarding data retrieved successfully", onboardingData),
      );
    } catch (error) {
      console.error("Get onboarding data error:", error);
      next(error);
    }
  }

  // =======================
  // OPEN TO WORK STATUS MANAGEMENT
  // =======================

  async updateOpenToWorkStatus(req, res, next) {
    try {
      const { openToWork } = req.body;

      if (typeof openToWork !== "boolean") {
        return res
          .status(400)
          .json(createErrorResponse("openToWork must be a boolean value", 400));
      }

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Update the openToWork status in profileData
      const updatedProfileData = {
        ...(candidate.profileData || {}),
        openToWork,
      };

      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: { profileData: updatedProfileData },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true, // Changed from city to cityId
              isActive: true,
              createdAt: true,
              city: {
                // Added city to include city details
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      res.json(
        createResponse("Open to Work status updated successfully", {
          openToWork,
          updatedAt: updatedCandidate.updatedAt,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getOpenToWorkStatus(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        select: { profileData: true, updatedAt: true },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const openToWork = candidate.profileData?.openToWork || false;

      res.json(
        createResponse("Open to Work status retrieved successfully", {
          openToWork,
          updatedAt: candidate.updatedAt,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getResumeHistory(req, res, next) {
    try {
      // This would require a separate resume_history table in production
      // For now, return empty array as placeholder
      res.json(createResponse("Resume history retrieved successfully", []));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // DASHBOARD & ANALYTICS
  // =======================

  async getDashboardStats(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Get applications statistics
      const applications = await prisma.allocation.findMany({
        where: { candidateId: candidate.id },
      });

      // Get bookmarks count
      const bookmarksCount = await prisma.bookmark.count({
        where: { candidateId: candidate.id },
      });

      // Calculate profile completeness
      const profileFields = [
        candidate.profileData,
        candidate.resumeUrl,
        candidate.education,
        candidate.experience,
        candidate.profilePhoto,
        candidate.dateOfBirth,
      ];
      const completedFields = profileFields.filter(
        (field) => field !== null && field !== undefined,
      ).length;
      const profileCompletion = Math.round(
        (completedFields / profileFields.length) * 100,
      );

      const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter((a) => a.status === "APPLIED").length,
        rejectedApplications: applications.filter((a) => a.status === "REJECTED").length,
        interviewScheduled: applications.filter((a) => a.status === "SHORTLISTED").length,
        profileViews: 0, // Placeholder - would require tracking
        profileCompletion,
        bookmarks: bookmarksCount,
        hasResume: !!candidate.resumeUrl,
      };

      res.json(
        createResponse("Dashboard statistics retrieved successfully", stats),
      );
    } catch (error) {
      next(error);
    }
  }

  async getProfileCompleteness(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const profileFields = [
        candidate.profileData,
        candidate.resumeUrl,
        candidate.education,
        candidate.experience,
        candidate.profilePhoto,
        candidate.dateOfBirth,
      ];

      const completedFields = profileFields.filter(
        (field) => field !== null && field !== undefined,
      ).length;
      const completeness = Math.round(
        (completedFields / profileFields.length) * 100,
      );

      const recommendations = [];
      if (!candidate.resumeUrl) recommendations.push("Upload your resume");
      if (!candidate.profilePhoto) recommendations.push("Add a profile photo");
      if (!candidate.experience || candidate.experience.length === 0)
        recommendations.push("Add work experience");
      if (!candidate.education || candidate.education.length === 0)
        recommendations.push("Add education details");

      res.json(
        createResponse("Profile completeness retrieved successfully", {
          completeness,
          recommendations,
          totalFields: profileFields.length,
          completedFields,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getActivityFeed(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Get recent activities (applications, bookmarks, etc.)
      const [recentApplications, recentBookmarks] = await Promise.all([
        prisma.allocation.findMany({
          where: { candidateId: candidate.id },
          take: parseInt(limit) / 2,
          include: {
            ad: { include: { company: true, location: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.bookmark.findMany({
          where: { candidateId: candidate.id },
          take: parseInt(limit) / 2,
          include: {
            ad: { include: { company: true, location: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      // Combine and sort activities
      const activities = [
        ...recentApplications.map((app) => ({
          type: "application",
          action: `Applied to ${app.ad.title}`,
          timestamp: app.createdAt,
          data: app,
        })),
        ...recentBookmarks.map((bookmark) => ({
          type: "bookmark",
          action: `Bookmarked ${bookmark.ad.title}`,
          timestamp: bookmark.createdAt,
          data: bookmark,
        })),
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json(
        createResponse(
          "Activity feed retrieved successfully",
          activities.slice(skip, skip + parseInt(limit)),
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // APPLICATION MANAGEMENT
  // =======================

  async getApplication(req, res, next) {
    try {
      const { applicationId } = req.params;

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const application = await prisma.allocation.findFirst({
        where: {
          id: applicationId,
          candidateId: candidate.id,
        },
        include: {
          ad: {
            include: {
              company: true,
              location: true,
              employer: {
                include: { user: { select: { name: true, email: true } } },
              },
            },
          },
        },
      });

      if (!application) {
        return res
          .status(404)
          .json(createErrorResponse("Application not found", 404));
      }

      res.json(
        createResponse("Application retrieved successfully", application),
      );
    } catch (error) {
      next(error);
    }
  }

  async withdrawApplication(req, res, next) {
    try {
      const { applicationId } = req.params;

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const application = await prisma.allocation.findFirst({
        where: {
          id: applicationId,
          candidateId: candidate.id,
          status: { in: ["APPLIED", "SHORTLISTED", "RATED"] }, // Can withdraw if not yet allocated/hired
        },
      });

      if (!application) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              "Application not found or cannot be withdrawn. You may have already been allocated or hired for this position.",
              404,
            ),
          );
      }

      // Delete the application record entirely so user can apply again
      await prisma.allocation.delete({
        where: { id: applicationId },
      });

      res.json(
        createResponse(
          "Application withdrawn successfully. You can now apply to this job again if you wish.",
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateApplicationNotes(req, res, next) {
    try {
      const { applicationId } = req.params;
      const { notes } = req.body;

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const application = await prisma.allocation.findFirst({
        where: {
          id: applicationId,
          candidateId: candidate.id,
        },
      });

      if (!application) {
        return res
          .status(404)
          .json(createErrorResponse("Application not found", 404));
      }

      const updatedApplication = await prisma.allocation.update({
        where: { id: applicationId },
        data: { notes },
      });

      res.json(
        createResponse(
          "Application notes updated successfully",
          updatedApplication,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // BOOKMARK MANAGEMENT
  // =======================

  async removeBookmark(req, res, next) {
    try {
      const { adId } = req.params;

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const deleted = await prisma.bookmark.deleteMany({
        where: {
          candidateId: candidate.id,
          adId: adId,
        },
      });

      if (deleted.count === 0) {
        return res
          .status(404)
          .json(createErrorResponse("Bookmark not found", 404));
      }

      res.json(createResponse("Bookmark removed successfully"));
    } catch (error) {
      next(error);
    }
  }

  async clearAllBookmarks(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const deleted = await prisma.bookmark.deleteMany({
        where: { candidateId: candidate.id },
      });

      res.json(
        createResponse(`${deleted.count} bookmarks cleared successfully`, {
          deletedCount: deleted.count,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // JOB DISCOVERY
  // =======================

  async getRecommendedJobs(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        include: { user: { include: { city: true } } }, // Changed from city to city
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Get jobs in candidate's city that match their skills
      const candidateSkills = candidate.tags || [];

      const jobs = await prisma.ad.findMany({
        where: {
          status: "APPROVED",
          isActive: true,
          locationId: candidate.user.cityId, // Use cityId from user relation
          // Filter out jobs already applied to
          allocations: {
            none: { candidateId: candidate.id },
          },
        },
        skip,
        take: parseInt(limit),
        include: {
          company: true,
          location: true,
          employer: { select: { isVerified: true } },
          _count: { select: { allocations: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: jobs.length,
        pages: Math.ceil(jobs.length / parseInt(limit)),
        hasNext: skip + parseInt(limit) < jobs.length,
        hasPrev: parseInt(page) > 1,
      };

      res.json(
        createResponse(
          "Recommended jobs retrieved successfully",
          jobs,
          pagination,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async getJobMatches(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        include: { user: { include: { city: true } } }, // Changed from city to city
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const candidateSkills = candidate.tags || [];

      // This would be more sophisticated in production with proper skill matching
      const jobs = await prisma.ad.findMany({
        where: {
          status: "APPROVED",
          isActive: true,
          allocations: {
            none: { candidateId: candidate.id },
          },
        },
        skip,
        take: parseInt(limit),
        include: {
          company: true,
          location: true,
          employer: { select: { isVerified: true } },
          _count: { select: { allocations: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(createResponse("Job matches retrieved successfully", jobs));
    } catch (error) {
      next(error);
    }
  }

  async getRecentlyViewedJobs(req, res, next) {
    try {
      // This would require a job_views table in production
      // For now, return empty array as placeholder
      res.json(
        createResponse("Recently viewed jobs retrieved successfully", []),
      );
    } catch (error) {
      next(error);
    }
  }

  async markJobAsViewed(req, res, next) {
    try {
      const { adId } = req.params;

      // This would create a record in job_views table in production
      // For now, just return success
      res.json(createResponse("Job marked as viewed successfully"));
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // RATINGS & FEEDBACK
  // =======================

  async getRatings(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        select: {
          ratings: true,
          overallRating: true,
          ratingHistory: true,
        },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      res.json(createResponse("Ratings retrieved successfully", candidate));
    } catch (error) {
      next(error);
    }
  }

  async getSkillRatingHistory(req, res, next) {
    try {
      const { skill } = req.params;

      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        select: { ratingHistory: true },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      // Filter rating history for specific skill
      const skillHistory = candidate.ratingHistory
        ? candidate.ratingHistory.filter((rating) => rating.skill === skill)
        : [];

      res.json(
        createResponse(
          "Skill rating history retrieved successfully",
          skillHistory,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  // =======================
  // PLACEHOLDER METHODS FOR NEW FEATURES
  // =======================

  // Notifications
  async getNotifications(req, res, next) {
    try {
      res.json(createResponse("Notifications retrieved successfully", []));
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(req, res, next) {
    try {
      res.json(createResponse("Notification marked as read successfully"));
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsAsRead(req, res, next) {
    try {
      res.json(createResponse("All notifications marked as read successfully"));
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      res.json(createResponse("Notification deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getNotificationPreferences(req, res, next) {
    try {
      res.json(
        createResponse("Notification preferences retrieved successfully", {
          emailNotifications: true,
          smsNotifications: false,
          jobAlerts: true,
          applicationUpdates: true,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateNotificationPreferences(req, res, next) {
    try {
      res.json(createResponse("Notification preferences updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  // Account Settings
  async getAccountSettings(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          name: true,
          email: true,
          phone: true,
          isActive: true,
          cityId: true, // Changed from city to cityId
          city: {
            // Added city to include city details
            select: {
              id: true,
              name: true,
              state: true,
            },
          },
        },
      });

      res.json(createResponse("Account settings retrieved successfully", user));
    } catch (error) {
      next(error);
    }
  }

  async updateAccountSettings(req, res, next) {
    try {
      const { name, phone } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
      });

      res.json(
        createResponse("Account settings updated successfully", updatedUser),
      );
    } catch (error) {
      next(error);
    }
  }

  async getPrivacySettings(req, res, next) {
    try {
      res.json(
        createResponse("Privacy settings retrieved successfully", {
          profileVisibility: "public",
          showPhoneNumber: false,
          showEmail: false,
          allowEmployerContact: true,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updatePrivacySettings(req, res, next) {
    try {
      res.json(createResponse("Privacy settings updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Current password and new password are required",
              400,
            ),
          );
      }

      // In production, verify current password and hash new password
      res.json(createResponse("Password changed successfully"));
    } catch (error) {
      next(error);
    }
  }

  async deactivateAccount(req, res, next) {
    try {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { isActive: false },
      });

      res.json(createResponse("Account deactivated successfully"));
    } catch (error) {
      next(error);
    }
  }

  // Statistics
  async getApplicationStats(req, res, next) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
      });

      if (!candidate) {
        return res
          .status(404)
          .json(createErrorResponse("Candidate profile not found", 404));
      }

      const stats = await prisma.allocation.groupBy({
        by: ["status"],
        where: { candidateId: candidate.id },
        _count: { status: true },
      });

      const formattedStats = stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
      }, {});

      res.json(
        createResponse(
          "Application statistics retrieved successfully",
          formattedStats,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async getProfileViews(req, res, next) {
    try {
      // This would require a profile_views table in production
      res.json(
        createResponse("Profile views retrieved successfully", {
          totalViews: 0,
          thisWeek: 0,
          thisMonth: 0,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getMarketInsights(req, res, next) {
    try {
      // This would analyze job market data in production
      res.json(
        createResponse("Market insights retrieved successfully", {
          demandForSkills: [],
          averageSalary: null,
          popularCompanies: [],
          growingIndustries: [],
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  // Legacy compatibility methods
  async applyToJobLegacy(req, res, next) {
    // Use the new applyToJob method but adapt the request
    req.body = { adId: req.params.adId, ...req.body };
    return this.applyToJob(req, res, next);
  }

  // =======================
  // FILE UPLOAD MANAGEMENT
  // =======================

  // Get upload URL for resumes
  async getUploadUrl(req, res, next) {
    try {
      console.log(
        "Getting resume upload URL for user:",
        req.user?.userId || req.user?.id,
      );

      // Use userId if available, fallback to id
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required. Please log in again.",
          error: "User ID not found in request",
        });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getResumeUploadURL(userId);

      console.log("Generated resume upload URL successfully for user:", userId);

      res.json({
        success: true,
        data: {
          uploadURL,
        },
      });
    } catch (error) {
      console.error("Get resume upload URL error:", error);
      res.status(500).json({
        success: false,
        message:
          "Failed to generate resume upload URL. Please ensure Object Storage is configured properly.",
        error: error.message,
      });
    }
  }

  // Get profile image upload URL
  async getProfileImageUploadUrl(req, res) {
    try {
      // Use userId if available, fallback to id
      const userId = req.user?.userId || req.user?.id;

      console.log("Getting profile image upload URL for user:", userId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required. Please log in again.",
          error: "User ID not found in request",
        });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadData = await objectStorageService.getProfileImageUploadURL(userId);

      console.log(
        "Generated profile image upload URL successfully for user:",
        userId,
        "Upload URL:", uploadData.signedUrl,
        "Public URL:", uploadData.publicUrl
      );

      res.json(
        createResponse("Profile image upload URL generated successfully", {
          uploadURL: uploadData.signedUrl,
          publicURL: uploadData.publicUrl,
          fileName: uploadData.fileName
        })
      );
    } catch (error) {
      console.error("Get profile image upload URL error:", error);
      res.status(500).json({
        success: false,
        message:
          "Failed to generate profile image upload URL. Please ensure Object Storage is configured properly.",
        error: error.message,
      });
    }
  }

  // Get cover image upload URL
  async getCoverImageUploadUrl(req, res) {
    try {
      // Use userId if available, fallback to id
      const userId = req.user?.userId || req.user?.id;

      console.log("Getting cover image upload URL for user:", userId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required. Please log in again.",
          error: "User ID not found in request",
        });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadData = await objectStorageService.getCoverImageUploadURL(userId);

      console.log(
        "Generated cover image upload URL successfully for user:",
        userId,
        "Upload URL:", uploadData.signedUrl,
        "Public URL:", uploadData.publicUrl
      );

      res.json(
        createResponse("Cover image upload URL generated successfully", {
          uploadURL: uploadData.signedUrl,
          publicURL: uploadData.publicUrl,
          fileName: uploadData.fileName
        })
      );
    } catch (error) {
      console.error("Get cover image upload URL error:", error);
      res.status(500).json({
        success: false,
        message:
          "Failed to generate cover image upload URL. Please ensure Object Storage is configured properly.",
        error: error.message,
      });
    }
  }

  // Upload optimized profile photo directly
  async uploadOptimizedProfilePhoto(req, res, next) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json(createErrorResponse("No image file provided", 400));
      }

      const userId = req.user.userId;
      const imageBuffer = req.file.buffer;

      console.log(`Received image for optimization: ${req.file.originalname}, size: ${(imageBuffer.length / 1024).toFixed(1)}KB`);

      const objectStorageService = new ObjectStorageService();

      // Get current candidate to check for existing profile photo
      const currentCandidate = await prisma.candidate.findUnique({
        where: { userId: userId },
        select: { profilePhoto: true },
      });

      // Delete old profile photo if it exists
      if (currentCandidate?.profilePhoto) {
        const oldFilePath = objectStorageService.extractFilePathFromUrl(currentCandidate.profilePhoto);
        if (oldFilePath) {
          console.log(`🗑️  Deleting old profile photo: ${oldFilePath}`);
          await objectStorageService.deleteFile(oldFilePath);
        }
      }

      // Upload optimized image
      const uploadResult = await objectStorageService.uploadOptimizedProfileImage(
        userId, 
        imageBuffer
      );

      // Create server URL for serving the image
      const serverImageUrl = `/api/public/images/${uploadResult.fileName}`;
      console.log("Storing server image URL:", serverImageUrl);

      // Update candidate profile with server URL
      const updatedCandidate = await prisma.candidate.update({
        where: { userId: userId },
        data: {
          profilePhoto: serverImageUrl,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true,
              isActive: true,
              createdAt: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      res.json(
        createResponse("Profile photo uploaded and optimized successfully", {
          candidate: updatedCandidate,
          imageInfo: {
            size: uploadResult.size,
            format: uploadResult.format,
            url: serverImageUrl
          }
        }),
      );
    } catch (error) {
      console.error("Upload optimized profile photo error:", error);
      res
        .status(500)
        .json(createErrorResponse("Failed to upload optimized profile photo", 500));
    }
  }

  // Update profile photo (legacy method for URL-based uploads)
  async updateProfilePhoto(req, res, next) {
    try {
      const { photoURL } = req.body;

      if (!photoURL) {
        return res
          .status(400)
          .json(createErrorResponse("Photo URL is required", 400));
      }

      const objectStorageService = new ObjectStorageService();
      console.log("Received photoURL:", photoURL);

      // Get current candidate to check for existing profile photo
      const currentCandidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        select: { profilePhoto: true },
      });

      // Delete old profile photo if it exists
      if (currentCandidate?.profilePhoto) {
        const oldFilePath = objectStorageService.extractFilePathFromUrl(currentCandidate.profilePhoto);
        if (oldFilePath) {
          console.log(`🗑️  Deleting old profile photo: ${oldFilePath}`);
          await objectStorageService.deleteFile(oldFilePath);
        }
      }

      // Extract the file path from the Google Cloud Storage URL
      const filePath = objectStorageService.extractFilePathFromUrl(photoURL);

      // Create server URL for serving the image
      const serverImageUrl = `/api/public/images/${filePath}`;
      console.log("Storing server image URL:", serverImageUrl);

      // Update candidate profile with server URL instead of direct GCS URL
      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: {
          profilePhoto: serverImageUrl,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true,
              isActive: true,
              createdAt: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      res.json(
        createResponse("Profile photo updated successfully", updatedCandidate),
      );
    } catch (error) {
      console.error("Update profile photo error:", error);
      res
        .status(500)
        .json(createErrorResponse("Failed to update profile photo", 500));
    }
  }

  // Update cover photo
  async updateCoverPhoto(req, res, next) {
    try {
      const { photoURL } = req.body;

      if (!photoURL) {
        return res
          .status(400)
          .json(createErrorResponse("Photo URL is required", 400));
      }

      const objectStorageService = new ObjectStorageService();
      console.log("Received cover photoURL:", photoURL);

      // Get current candidate to check for existing cover photo
      const currentCandidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        select: { coverPhoto: true },
      });

      // Delete old cover photo if it exists
      if (currentCandidate?.coverPhoto) {
        const oldFilePath = objectStorageService.extractFilePathFromUrl(currentCandidate.coverPhoto);
        if (oldFilePath) {
          console.log(`🗑️  Deleting old cover photo: ${oldFilePath}`);
          await objectStorageService.deleteFile(oldFilePath);
        }
      }

      // Extract the file path from the Google Cloud Storage URL
      const filePath = objectStorageService.extractFilePathFromUrl(photoURL);

      // Create server URL for serving the image
      const serverImageUrl = `/api/public/images/${filePath}`;
      console.log("Storing server cover photo URL:", serverImageUrl);

      // Update candidate profile with server URL instead of direct GCS URL
      const updatedCandidate = await prisma.candidate.update({
        where: { userId: req.user.userId },
        data: {
          coverPhoto: serverImageUrl,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              cityId: true,
              isActive: true,
              createdAt: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      res.json(
        createResponse("Cover photo updated successfully", updatedCandidate),
      );
    } catch (error) {
      console.error("Update cover photo error:", error);
      res
        .status(500)
        .json(createErrorResponse("Failed to update cover photo", 500));
    }
  }

  // Search jobs with candidate-specific status (bookmarks and applications)
  async searchJobsWithStatus(req, res, next) {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        location,
        category,
        jobType,
        experience,
        salaryRange,
        sortBy = "newest",
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      let where = {
        status: "APPROVED",
        isActive: true,
      };

      // Add search functionality
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      // Location filter
      if (location) {
        where.location = {
          OR: [
            { name: { contains: location, mode: "insensitive" } },
            { state: { contains: location, mode: "insensitive" } },
          ],
        };
      }

      // Set up sorting
      let orderBy = [{ createdAt: "desc" }]; // default
      switch (sortBy) {
        case "oldest":
          orderBy = [{ createdAt: "asc" }];
          break;
        case "salary-high":
          orderBy = [{ salaryMax: "desc" }];
          break;
        case "salary-low":
          orderBy = [{ salaryMin: "asc" }];
          break;
        case "relevance":
          orderBy = [{ updatedAt: "desc" }];
          break;
      }

      // Get candidate ID from user
      let candidate = await prisma.candidate.findUnique({
        where: { userId: req.user.userId },
        select: { id: true, user: { select: { cityId: true, city: true } } }, // Include cityId and city
      });

      if (!candidate) {
        // Create candidate profile if it doesn't exist
        const newCandidate = await prisma.candidate.create({
          data: {
            userId: req.user.userId,
            skills: [],
            experience: [],
            education: [],
            isActive: true,
          },
        });
        candidate = {
          id: newCandidate.id,
          user: { cityId: null, city: null },
        }; // Initialize cityId and city
      }

      // Add location filter based on candidate's city if location is not provided in query
      if (location === undefined && candidate.user?.cityId) {
        where.locationId = candidate.user.cityId;
      }

      const [jobs, total, userBookmarks, userApplications] = await Promise.all([
        prisma.ad.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                industry: true,
              },
            },
            location: {
              select: {
                id: true,
                name: true,
                state: true,
              },
            },
          },
          orderBy,
        }),
        prisma.ad.count({ where }),
        // Get user's bookmarks
        prisma.bookmark.findMany({
          where: { candidateId: candidate.id },
          select: { adId: true },
        }),
        // Get user's applications
        prisma.allocation.findMany({
          where: { candidateId: candidate.id },
          select: { adId: true },
        }),
      ]);

      // Create sets for faster lookup
      const bookmarkedJobIds = new Set(userBookmarks.map((b) => b.adId));
      const appliedJobIds = new Set(userApplications.map((a) => a.adId));

      // Transform jobs for frontend with status
      const transformedJobs = jobs.map((job) => {
        const isBookmarked = bookmarkedJobIds.has(job.id);
        const hasApplied = appliedJobIds.has(job.id);
        const salaryMin = job.salaryMin ? Number(job.salaryMin) : null;
        const salaryMax = job.salaryMax ? Number(job.salaryMax) : null;

        return {
          id: job.id,
          title: job.title,
          company: {
            id: job.company.id,
            name: job.company.name,
            logo: job.company.logo,
            industry: job.company.industry,
          },
          location: job.location,
          salary:
            salaryMin && salaryMax
              ? `₹${salaryMin} - ₹${salaryMax}`
              : salaryMin
                ? `₹${salaryMin}+`
                : "Negotiable",
          salaryMin: salaryMin,
          salaryMax: salaryMax,
          skills: job.skills
            ? job.skills.split(",").map((skill) => skill.trim())
            : [],
          experienceLevel: job.experienceLevel || "Not specified",
          employmentType: job.employmentType || "FULL_TIME",
          numberOfPositions: job.numberOfPositions,
          createdAt: job.createdAt,
          validUntil: job.validUntil,
          description: job.description,
          featured: false,
          // Add user-specific status
          isBookmarked,
          hasApplied,
        };
      });

      const response = {
        jobs: transformedJobs,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      };

      res.json(createResponse("Jobs retrieved successfully", response));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CandidateController();