import React, { useState } from 'react';
import './HomePage.css'; // ייבוא קובץ ה-CSS

function HomePage() {
  const [items, setItems] = useState([]); 
  const [inputValue, setInputValue] = useState(""); 

  const addItem = () => {
    if (inputValue.trim()) {
      setItems([...items, inputValue]);
      setInputValue(""); // איפוס שדה הקלט
    }
  };

  return (
    <div className="container">
      <h1 className="title">רשימת משימות</h1>
      <input
        className="input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="הכנס משימה חדשה"
      />
      <button className="button" onClick={addItem}>הוסף משימה</button>
      <div className="list-container">
        {items.map((item, index) => (
          <div key={index} className="list-item">{item}</div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
