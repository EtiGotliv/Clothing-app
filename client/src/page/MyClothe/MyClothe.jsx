import React, { useEffect, useState } from 'react';

function MyClothes() {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/clothes') // בקשה לשרת
      .then(response => response.json())
      .then(data => setClothes(data)) // עדכון המצב עם הבגדים שהתקבלו
      .catch(error => console.error('Error fetching clothes:', error));
  }, []);

  return (
    <div>
      <h1>הבגדים שלי</h1>
      <p>כאן תוכל לראות את הבגדים שבחרת.</p>
        <p>אין בגדים להצגה כרגע.</p>
    </div>
  );
}

export default MyClothes;
