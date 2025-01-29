import React, { useEffect, useState } from 'react';

function MyClothes() {
  const [clothes, setClothes] = useState([]);
  return (
    <div>
      <h1>הבגדים שלי</h1>
      <p>כאן תוכל לראות את הבגדים שבחרת.</p>
        <p>אין בגדים להצגה כרגע.</p>
    </div>
  );
}

export default MyClothes;
