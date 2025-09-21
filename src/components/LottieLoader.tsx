import React from 'react';
import Lottie from 'lottie-react';
import sandyLoading from '../../public/Sandy_Loading.json';

export default function LottieLoader({ className = '', style = {}, height = 120, width = 120 }) {
  return (
    <div className={`flex items-center justify-center w-full ${className}`} style={style}>
      <Lottie animationData={sandyLoading} loop={true} style={{ height, width }} />
    </div>
  );
}
