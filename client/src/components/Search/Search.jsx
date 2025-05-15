import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./Search.css";
import LoadingAnimation from "../common/LoadingAnimation/LoadingAnimation";

const Search = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

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
          const uniqueItems = Array.from(new Set(
            (Array.isArray(data) ? data : [data]).map(item => item.name)
          ));

          const filtered = uniqueItems.filter(name =>
            name.toLowerCase().includes(debouncedQuery.toLowerCase())
          );

          setResults(filtered);
          setShowNoResults(filtered.length === 0);
          setIsOpen(true);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setResults([]);
      setShowNoResults(false);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    setQuery("");
    setResults([]);
    setShowNoResults(false);
    setIsAnimating(false);
    setIsOpen(false);
  }, [location.pathname]);

  const handleNavigation = (name) => {
    setQuery("");
    setResults([]);
    setShowNoResults(false);
    setIsAnimating(false);
    setIsOpen(false);
    onClose();
    navigate(`/category/${name}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      handleNavigation(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowNoResults(false);
    setIsOpen(false);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
        setShowNoResults(false);
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" ref={searchRef}>
      <div className="input-wrapper">
        <FaSearch id="search-icon" />
        <input
          type="text"
          placeholder="חיפוש פריט, קטגוריה, רעיון..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
          >
            ×
          </button>
        )}
      </div>

      {isAnimating && <LoadingAnimation shouldShow={isAnimating} />}
      {error && <div>❌ Error: {error}</div>}
      {loading && <div>טוען...</div>}

      {!isAnimating && !loading && query && showNoResults && isOpen && (
        <div className="no-results">
          <div className="no-results-content">
            <span role="img" aria-label="no-results" className="no-results-icon">🔍😞</span>
            <p>לא נמצאו תוצאות מתאימות</p>
            <small>נסו לנסח את החיפוש בצורה אחרת</small>
          </div>
        </div>
      )}

      {!isAnimating && results.length > 0 && isOpen && (
        <ul className="results-list">
          {results.slice(0, 5).map((name, index) => (
            <li key={index} onClick={() => handleNavigation(name)}>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
