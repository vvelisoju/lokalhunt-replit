
import React from "react";
import { useTranslation } from "react-i18next";
import JobsList from "../../components/ui/JobsList";

const CandidateJobs = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <JobsList 
        showFilters={true}
        title="Browse Jobs"
        subtitle="Find opportunities tailored for you based on your profile and preferences"
        apiEndpoint="public"
      />
    </div>
  );
};

export default CandidateJobs;
