import { useState, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { observer } from "mobx-react-lite"
import { stateManager } from "../../managers/StateManager"
import { Scene } from "../r3f/Scene"
import "./Viewer3D.css"
import * as THREE from "three"
import { Suspense } from "react"
import { Environment, ContactShadows } from "@react-three/drei"

const Viewer3D = observer(() => {
  const { chairManager, topColorManager, topManager, baseManager } = stateManager.designManager;
  const [activeView, setActiveView] = useState("Front");
  const [hoveredView, setHoveredView] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const didInitRef = useRef(false);
  const prevRef = useRef({
    baseId: baseManager.selectedBaseId,
    baseColorId: baseManager.selectedBaseColorId,
    topId: topManager.selectedTopId,
    topColorId: topColorManager.selectedTopColorId,
    chairQty: chairManager.chairQuantity
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const baseViews = ["Front", "Left", "Top", "Right"];
  const chairViews = ["Two Chair", "Chair", "Chair Top"];
  const allViews = chairManager.chairQuantity > 0
    ? [...baseViews, ...chairViews]
    : baseViews;

  const selectedTopColor = topColorManager.selectedTopColor
  const selectedTop = topManager.selectedTop

  const infoTitle = selectedTopColor?.name || selectedTop?.name || "Table Top"
  const infoTag = selectedTopColor?.type || "Natural"
  const infoDescription =
    selectedTopColor?.description ||
    "A refined tabletop finish with a balanced tone and subtle character."

  useEffect(() => {
    const prev = prevRef.current;
    const next = {
      baseId: baseManager.selectedBaseId,
      baseColorId: baseManager.selectedBaseColorId,
      topId: topManager.selectedTopId,
      topColorId: topColorManager.selectedTopColorId,
      chairQty: chairManager.chairQuantity
    };

    if (!didInitRef.current) {
      didInitRef.current = true;
      prevRef.current = next;
      return;
    }

    const baseChanged =
      next.baseId !== prev.baseId || next.baseColorId !== prev.baseColorId;
    const topChanged =
      next.topId !== prev.topId || next.topColorId !== prev.topColorId;
    const chairsJustEnabled = prev.chairQty === 0 && next.chairQty > 0;

    if (baseChanged) {
      setActiveView("Front");
    } else if (topChanged) {
      setActiveView("Top");
    } else if (chairsJustEnabled) {
      setActiveView("Two Chair");
    }

    prevRef.current = next;
  }, [
    baseManager.selectedBaseId,
    baseManager.selectedBaseColorId,
    topManager.selectedTopId,
    topColorManager.selectedTopColorId,
    chairManager.chairQuantity
  ]);

  const toggleFullscreen = () => {
  const elem = containerRef.current;
  if (!elem) return;

  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) { /* Chrome/Safari */
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) { /* IE11 */
      (elem as any).msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleSave = () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;

  // 1. Create a temporary link
  const link = document.createElement('a');
  link.setAttribute('download', 'my-table-config.png');
  
  // 2. Convert canvas to data URL
  const image = canvas.toDataURL('image/png');
  link.setAttribute('href', image);
  
  // 3. Trigger download
  link.click();
};

const handleShare = async () => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;

  // 1. Capture the Screenshot as a Blob
  const blob = await new Promise<Blob | null>((resolve) => 
    canvas.toBlob(resolve, 'image/png')
  );

  if (!blob) return;

  // 2. Prepare the details from your state
  const details = `Check out my configuration: 
- Base: ${stateManager.designManager.baseManager.selectedBase?.label}
- Top: ${stateManager.designManager.topManager.selectedTop?.name}
- Chairs: ${stateManager.designManager.chairManager.chairQuantity}x ${stateManager.designManager.chairManager.selectedChair?.name}`;

  // 3. Create a File object for sharing
  const file = new File([blob], 'my-config.png', { type: 'image/png' });

  // 4. Use the Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Custom Table Design',
        text: details,
        files: [file], // This attaches the screenshot
        url: window.location.href, // This provides the link back
      });
    } catch (err) {
      console.log('User cancelled or sharing failed', err);
    }
  } else {
    // Fallback: Just copy the link if native share isn't supported (e.g., older PCs)
    navigator.clipboard.writeText(`${details}\n\nLink: ${window.location.href}`);
    alert("Share details copied to clipboard (Native sharing not supported on this browser)");
  }
};

  // Function to handle arrow navigation
  const navigate = (direction: 'next' | 'prev') => {
    const currentIndex = allViews.indexOf(activeView);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= allViews.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = allViews.length - 1;

    setActiveView(allViews[nextIndex]);
  };


  return (
    <div className="viewer-3d-container" ref={containerRef}>
      {showInfo && (
        <div className="viewer-info-panel" role="button" onClick={() => setShowInfo(true)}>
          <div className="viewer-info-header">
            <h4>{infoTitle}</h4>
            <button
              className="viewer-info-close"
              onClick={(event) => {
                event.stopPropagation()
                setShowInfo(false)
              }}
              aria-label="Close details"
            >
              ×
            </button>
          </div>
          <div className="viewer-info-tag">{infoTag}</div>
          <p className="viewer-info-desc">{infoDescription}</p>
        </div>
      )}
      {!showInfo && (
        <button
          className="viewer-info-toggle"
          onClick={() => setShowInfo(true)}
          aria-label="Show table top details"
        >
          i
        </button>
      )}

      <div className="canvas-actions-overlay">
  {/* Save Button */}
  <button className="canvas-action-btn" onClick={handleSave} title="Download Image">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  </button>

  {/* Share Button */}
  <button className="canvas-action-btn" onClick={handleShare} title="Copy Link">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  </button>

  {/* Fullscreen Button */}
  <button className="canvas-action-btn" onClick={toggleFullscreen}>
    {isFullscreen ? (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
      </svg>
    ) : (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
    )}
  </button>
</div>
      <div className="dot-navigation-wrapper">
        {/* Added onClick for arrows */}
        <div className="arrow-nav prev" onClick={() => navigate('prev')}>‹</div>

        <div className="dots-container">
          {allViews.map((view) => (
            <div
              key={view}
              className="dot-item"
              onMouseEnter={() => setHoveredView(view)}
              onMouseLeave={() => setHoveredView(null)}
              onClick={() => setActiveView(view)}
            >
              {hoveredView === view && (
                <div className="view-tooltip">{view} View</div>
              )}
              <div className={`nav-dot ${activeView === view ? "active" : ""}`} />
            </div>
          ))}
        </div>

        <div className="arrow-nav next" onClick={() => navigate('next')}>›</div>
      </div>

      <Canvas
        shadows // Enables shadows
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping, // Better color range
          outputColorSpace: THREE.SRGBColorSpace
        }}
        camera={{ position: [5, 5, 5], fov: 35 }}
      >
        <Suspense fallback={null}>
          <pointLight position={[2, 2, 2]} intensity={5} color="#cae9ff" />
          <Scene activeView={activeView} />

          <pointLight
            position={[2, 5, 2]}
            intensity={1.5}
            color="#ffffff"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          
          <Environment preset="city" /> {/* Critical for metal/marble reflections */}
          <ContactShadows opacity={0.22} scale={8} blur={0.3} far={4.5} 
          position={[0, -0.01, 0.08]}/>
        </Suspense>
      </Canvas>
    </div>
  )
})

export default Viewer3D
