const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const result = await getCompanies();

      if (result.success) {
        // Handle nested data structure from API response
        const companiesData = result.data?.data || result.data || [];
        console.log('Companies API response:', result);
        console.log('Extracted companies:', companiesData);
        setCompanies(companiesData);
      } else {
        setError(result.error || 'Failed to load companies');
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      setError('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };