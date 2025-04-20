import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './LoadingAnimation.module.css';

const LoadingAnimation = ({ shouldShow, children }) => {
  return (
    <>
      {shouldShow && (
        <div className={styles.loadingContainer}>
          <DotLottieReact
            src="https://lottie.host/004e92d2-5885-4b39-8236-ba466e44c456/llFPjexqAD.lottie"
            loop={false}
            autoplay
            speed={1.9}
            style={{ width: '150px', height: '150px' }}
            className={styles.lottieAnimation}
            segment={[70, 270]}
          />
        </div>
      )}
      {children}
    </>
  );
};

export default LoadingAnimation;
