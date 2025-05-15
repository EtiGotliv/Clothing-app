import React from 'react';

const ScanCanvas = ({ canvasRef }) => {
  return (
    <canvas 
      ref={canvasRef} 
      width={640} 
      height={480} 
      style={{ display: 'none' }} 
    />
  );
};

export default ScanCanvas;