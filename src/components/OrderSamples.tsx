import { useState, useMemo, useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { stateManager } from "../managers/StateManager";
import "../Styles/OrderSamples.css";

export const OrderSamples = observer(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { topColorManager } = stateManager.designManager;

    // 1. STATE
    const [hoveredData, setHoveredData] = useState<any | null>(null);
    const [selectedSamples, setSelectedSamples] = useState<string[]>([]);

    // 2. MEMOIZED CATEGORIES
    const categories = useMemo(() => {
      const colors = topColorManager.topColors || [];

      const groups = [
        { id: "natural", label: "Natural", items: [] as any[] },
        { id: "polish", label: "Polish", items: [] as any[] },
        { id: "silk", label: "Silk", items: [] as any[] },
      ];

      colors.forEach((tc: any) => {
        const typeKey = (tc.type || "").toLowerCase();
        const cat = groups.find((g) => g.id === typeKey);
        (cat || groups[0]).items.push(tc);
      });

      return groups.filter((g) => g.items.length > 0);
    }, [topColorManager.topColors]);

    // 3. PRELOAD IMAGES FOR SMOOTH HOVER
    useEffect(() => {
      categories.forEach((cat) => {
        cat.items.forEach((tc) => {
          const img = new Image();
          img.src = tc.sample || tc.base;
        });
      });
    }, [categories]);

    // 4. SAMPLE TOGGLE
    const toggleSample = useCallback((id: string) => {
      setSelectedSamples((prev) =>
        prev.includes(id)
          ? prev.filter((s) => s !== id)
          : [...prev, id]
      );
    }, []);

    const totalPrice = Math.ceil(selectedSamples.length / 2) * 20;

    // 5. CONDITIONAL RENDER
    if (!isOpen) return null;

    return (
      <div className="order-sample-overlay" onClick={onClose}>
        <div
          className="order-sample-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>

          <h2 className="modal-title">Order Samples</h2>

          <div className="modal-content-layout">
            <div className="modal-scroll-area">
              <div className="sample-pricing-card">
                <h3>Sample Pricing</h3>
                <ul>
                  <li>
                    A pair of samples costs &pound;20. Ordering one is also &pound;20.
                  </li>
                  <li>
                    Every additional pair (or single extra) is &pound;20.
                  </li>
                </ul>
              </div>

              {categories.map((cat) => (
                <div key={cat.id} className="samples-section">
                  <h4 className="category-label">{cat.label}</h4>

                  <div className="samples-grid">
                    {cat.items.map((tc: any) => (
                      <div key={tc.id} className="sample-container">
                        <button
                          className={`sample-tile ${
                            selectedSamples.includes(tc.id)
                              ? "is-selected"
                              : ""
                          }`}
                          onMouseEnter={() => setHoveredData(tc)}
                          onMouseLeave={() => setHoveredData(null)}
                          onClick={() => toggleSample(tc.id)}
                        >
                          <img
                            src={tc.base}
                            alt={tc.name}
                            loading="lazy"
                          />

                          {selectedSamples.includes(tc.id) && (
                            <div className="selected-check">&check;</div>
                          )}
                        </button>

                        <span className="sample-name-label">
                          {tc.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* PREVIEW PANEL */}
            <div
              className={`hover-preview-side ${
                hoveredData ? "is-active" : ""
              }`}
            >
              {hoveredData && (
                <div className="preview-card-internal">
                  <div className="preview-image-container">
                    <img
                      key={hoveredData.id}
                      src={hoveredData.sample || hoveredData.base}
                      alt={hoveredData.name}
                    />
                  </div>

                  <div className="preview-meta">
                    <h3 className="preview-name">
                      {hoveredData.name}
                    </h3>

                    <p className="preview-description">
                      {hoveredData.description ||
                        "Detailed texture with natural movement."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              className={`buy-now-btn ${
                selectedSamples.length > 0 ? "active" : ""
              }`}
              disabled={selectedSamples.length === 0}
            >
              Buy Now{" "}
              {selectedSamples.length > 0
                ? `${totalPrice.toFixed(2)}`
                : ""}{" "}
              &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }
);
