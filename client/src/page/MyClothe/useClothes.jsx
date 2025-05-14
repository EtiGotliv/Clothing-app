import { useState, useEffect } from 'react';

export const useClothes = (url) => {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClothes = () => {
    const token = localStorage.getItem("authToken");
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setClothes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClothes();
  }, [url]);

  return { clothes, loading, error, fetchClothes };
};
