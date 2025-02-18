import { useState, useEffect } from 'react';

const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken'); // קבלת ה-token מ-localStorage

      try {
        const response = await fetch(url,{

         headers: {
            'Authorization': `Bearer ${token}`, // שליחה של ה-token עם כל בקשה
          },
        });

        if (!response.ok) {
          throw new Error('❌ Error fetching data');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
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
