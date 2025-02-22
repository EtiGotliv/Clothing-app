// src/components/Search/Search.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./Search.css";
import LoadingAnimation from "../common/LoadingAnimation/LoadingAnimation";

const Search = () => {
  const [query, setQuery] = useState(""); 
  const [debouncedQuery, setDebouncedQuery] = useState(""); 
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  // עדכון הערך הדבוק (debounced) לאחר 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // שליפת תוצאות חיפוש מהשרת בהתאם ל-debouncedQuery
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setLoading(true);
      const userId = localStorage.getItem("authToken");
      const encodedQuery = encodeURIComponent(debouncedQuery);
      fetch(`http://localhost:8080/api/clothes/search?query=${encodedQuery}`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      })
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
  }, [debouncedQuery]);

  // ניווט לעמוד הקטגוריה של הפריט שנבחר
  const handleNavigation = (category) => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate(`/category/${category}`);
      setIsAnimating(false);
    }, 2500);
  };

  return (
    <div className="search-container">
      <div className="input-wrapper">
        <FaSearch id="search-icon" />
        <input
          type="text"
          placeholder="Search clothing..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {isAnimating && <LoadingAnimation shouldShow={isAnimating} />} 
      {error && <div>❌ Error: {error}</div>}
      {loading && <div>Loading...</div>}
      {!isAnimating && results.length > 0 && (
        <ul className="results-list">
          {results.slice(0, 5).map((item) => (
            <li key={item._id} onClick={() => handleNavigation(item.name)}>
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
