import { useState, useEffect } from 'react';

const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log(`📡 Fetching data from: ${url}`); // הדפסת ה-URL לבדיקה

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📦 Data received:', result); // הדפסת הנתונים המתקבלים
        setData(result);
      } catch (error) {
        console.error('❌ Fetch error:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useApi;
