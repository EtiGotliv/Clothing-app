import React from 'react';

export default function LookPreview({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {items.map((itemId, index) => (
        <img
          key={index}
          src={`http://localhost:8080/api/clothes/image-no-bg/${itemId}`}
          style={{ width: '150px', marginBottom: '8px' }}
        />
      ))}
    </div>
  );
}
