import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function Loader() {
  const { active, progress } = useProgress();
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      // Add a slight delay to ensure smooth transition
      const timer = setTimeout(() => {
        setHasInitialLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (!active) return null;

  // Secondary Loader (Canvas Overlay)
  if (hasInitialLoaded) {
    return (
      <div className="canvas-loader">
        <div className="spinner"></div>
        <style>{`
          .canvas-loader {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 16px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: none;
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            font-weight: 500;
            color: #333;
          }
          .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid #ccc;
            border-top-color: #000;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <span>Updating...</span>
      </div>
    );
  }

  // Initial Full Screen Loader
  return (
    <>
      <div className="loader-container">
        <div className="loader-branding">
          BeMade<span className="tm">TM</span>
        </div>

        <div className="loader-bar-bg">
          <div className="loader-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="loader-text">
          {progress < 100 ? `Loading 3D Experience... ${progress.toFixed(0)}%` : "Preparing..."}
        </div>
      </div>
      <style>{`
        .loader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          z-index: 10000; /* Highest z-index */
          font-family: 'Inter', sans-serif;
        }
        .loader-branding {
          font-size: 32px;
          font-weight: 700;
          color: #111;
          margin-bottom: 24px;
          letter-spacing: -0.5px;
        }
        .loader-branding .tm {
          font-size: 12px;
          vertical-align: super;
          margin-left: 2px;
        }
        .loader-bar-bg {
          width: 240px;
          height: 4px;
          background: #eee;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .loader-bar {
          height: 100%;
          background: #111;
          transition: width 0.2s ease-out;
        }
        .loader-text {
          font-size: 14px;
          color: #888;
          font-weight: 400;
          letter-spacing: 0.5px;
        }
      `}</style>
    </>
  );
}
