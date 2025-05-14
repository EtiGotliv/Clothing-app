import React from 'react';

function ScanCanvas({ canvasRef }) {
    return <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />;
}

export default ScanCanvas;
