import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import "./Search.css";

export const Search = () => {
  const [query, setQuery] = useState(""); 
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length > 0) {
      setLoading(true);
      fetch(`http://localhost:8080/api/clothes/search?query=${query}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (category) => {
    navigate(`/category/${category}`);
  };

  return (
    <div className="search-container">
      <div className="input-wrapper">
        <FaSearch id="search-icon" />
        <input
          type="text"
          placeholder="הקלד לחיפוש..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {loading && <div>⏳ טוען...</div>}
      {error && <div>❌ שגיאה: {error}</div>}
      {results.length > 0 && (
        <ul className="results-list">
          {results.slice(0, 5).map((item) => (
            <li key={item._id} onClick={() => handleSelect(item.name)}>
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;