
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CandidatePublicProfile from '../../components/ui/CandidatePublicProfile'

const CandidateProfileView = () => {
  const { candidateId } = useParams()
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <CandidatePublicProfile 
          candidateId={candidateId}
          onBack={handleGoBack}
          showActions={true}
          className="bg-gray-50"
        />
      </div>
    </div>
  )
}

export default CandidateProfileView
