import { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { stateManager } from "../managers/StateManager"
import "./BaseSelector.css"
import "./TopSelector.css"
import "./ChairSelector.css"
import { useNavigate } from "react-router-dom"


const BaseSelector = observer(() => {
  const navigate = useNavigate()
  const { designManager } = stateManager
  const { baseManager, topManager, topColorManager, chairManager } = designManager
  // const design3D = stateManager.design3DManager

  useEffect(() => {
    if (baseManager.bases.length === 0) baseManager.loadBases()
    if (topManager.tops.length === 0) topManager.loadTops()
    if (topColorManager.topColors.length === 0) topColorManager.loadTopColors()
    if (chairManager.chairs.length === 0) chairManager.loadChairs()
  }, [baseManager, topManager, topColorManager, chairManager])

  const selectedBase = baseManager.selectedBase
  const selectedTop = topManager.selectedTop
  const selectedChair = chairManager.selectedChair
  const seatingTypeLabel = chairManager.seatingTypeLabel
  const baseLabel = selectedBase?.label?.toLowerCase() ?? ""
  const baseId = baseManager.selectedBaseId ?? ""
  const isLineaDome = baseId === "linea-dome" || baseLabel === "linea dome"
  const isLineaContour = baseId === "linea-contour" || baseLabel === "linea contour"
  const minTopLength = isLineaContour ? 2000 : 1600

  const handlePlaceOrder = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement | null
    if (canvas) {
      try {
        const image = canvas.toDataURL("image/png")
        sessionStorage.setItem("checkout_snapshot", image)
      } catch {
        // Ignore snapshot errors and proceed to checkout
      }
    }
    navigate("/checkout")
  }

  const isTopAllowed = (top: { name: string }) => {
    const name = top.name.toLowerCase()
    const isRoundOrSquare = name.includes("round") || name.includes("square")
    // Linea Dome -> only round & square
    if (isLineaDome) return isRoundOrSquare
    // Other bases -> only the 4 non-round/square shapes
    return !isRoundOrSquare
  }

  useEffect(() => {
    if (topManager.tops.length === 0) return
    if (selectedTop && isTopAllowed(selectedTop)) return

    const preferredNonLinea =
      !isLineaDome
        ? topManager.tops.find((t) => t.id === "capsule" && isTopAllowed(t))
        : undefined
    const firstAllowed = preferredNonLinea ?? topManager.tops.find(isTopAllowed)

    if (firstAllowed && firstAllowed.id !== topManager.selectedTopId) {
      topManager.selectTop(firstAllowed.id)
    }
  }, [isLineaDome, selectedTop, topManager.selectedTopId, topManager.tops])

  useEffect(() => {
    if (!isLineaContour) return
    if (topManager.topLength < minTopLength) {
      topManager.setTopLength(minTopLength)
    }
  }, [isLineaContour, minTopLength, topManager, topManager.topLength])

  if (chairManager.loading) return <div>Loading chairsâ€¦</div>
  if (chairManager.error) return <div>{chairManager.error}</div>

  if (baseManager.loading) return <div>Loading basesâ€¦</div>
  if (baseManager.error) return <div>{baseManager.error}</div>

  if (topManager.loading) return <div>Loading topsâ€¦</div>
  if (topManager.error) return <div>{topManager.error}</div>

  const calculateTablePrice = () => {
    const shape = selectedTop?.name?.toLowerCase() || "";

    // Square Pricing
    if (shape.includes("square")) {
      const size = topManager.topSize;
      if (size <= 1200) return 2190;
      if (size <= 1300) return 2380;
      if (size <= 1400) return 2650;
      return 2880;
    }

    // Round Pricing
    if (shape.includes("round")) {
      const dia = topManager.topDiameter;
      if (dia <= 1200) return 2290;
      if (dia <= 1300) return 2480;
      if (dia <= 1400) return 2750;
      return 2980;
    }

    // Rectangular / Oval Pricing
    const length = topManager.topLength;
    if (length <= 2200) return 2880;
    if (length <= 2450) return 3312;
    if (length <= 2850) return 3576;
    return 3840;
  };

  const tablePrice = calculateTablePrice();
  const chairUnitPrice = 100; // Based on £1200 for 12 chairs in your attachment
  const chairsTotalPrice = chairManager.chairQuantity * chairUnitPrice;
  const grandTotal = tablePrice + chairsTotalPrice;

  return (
    <div className="base-selector-container">

      <h2 className="base section-anchor" id="step-base">Choose Base</h2>
      <div className="base-selector">
        {baseManager.bases.map((base) => (
          <button
            key={base.id}
            className={`base-item  ${baseManager.selectedBaseId === base.id ? "active is-selected" : ""}`}
            disabled={base.disabled}
            onClick={() => baseManager.selectBase(base.id)}
          >
            <img src={base.preview} alt={base.label} />
            <span>{base.label}</span>
          </button>
        ))}
      </div>

      {selectedBase && (
        <>
          <h2 className="base section-anchor" id="step-base-colour" style={{ marginTop: 40 }}>Choose Base Color</h2>
          <div className="base-selector">
            {selectedBase.color1 && (
              <div>
                <button
                  className={`base-item color-item ${baseManager.selectedBaseColorId === "color1" ? "active is-selected" : ""}`}
                  onClick={() => baseManager.selectBaseColor("color1")}
                >
                  <img src={selectedBase.color1.base} alt={selectedBase.color1.name} />
                  <span>{selectedBase.color1.name}</span>
                </button>

              </div>
            )}
            {selectedBase.color2 && (
              <div>
                <button
                  className={`base-item color-item ${baseManager.selectedBaseColorId === "color2" ? "active is-selected" : ""}`}
                  onClick={() => baseManager.selectBaseColor("color2")}
                >
                  <img src={selectedBase.color2.base} alt={selectedBase.color2.name} />
                  <span>{selectedBase.color2.name}</span>
                </button>

              </div>
            )}
          </div>

          <div className="top-selector-container">
            <h2 className="base section-anchor" id="step-top-colour">Choose Top Colour</h2>
            {topColorManager.loading && <div>Loading top colours...</div>}

            {!topColorManager.loading && topColorManager.categories.map((cat) => {
              const itemsInCategory = topColorManager.getColorsByCategory(cat);

              // Only render the section if there are items in that category
              if (itemsInCategory.length === 0) return null;

              return (
                <div key={cat} className="top-color-group" style={{ marginBottom: '30px' }}>
                  {/* Category Header (Static label, not a button) */}
                  <h3 style={{
                    textTransform: 'capitalize',
                    marginBottom: '15px',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>
                    {cat}
                  </h3>

                  <div className="base-selector">
                    {itemsInCategory.map((tc) => (
                      <div key={tc.id} className="color-item-wrapper">
                        <button
                          className={`base-item color-item ${topColorManager.selectedTopColorId === tc.id ? "active is-selected" : ""}`}
                          onClick={() => topColorManager.selectTopColor(tc.id)}
                          style={{ position: 'relative' }}
                        >
                          <img src={tc.base} alt={tc.name} />
                          <span>{tc.name}</span>
                        </button>

                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <h2 className="top section-anchor" id="step-top-shape" style={{ marginTop: 28 }}>Choose Table Top Shape</h2>
            <div className="top-selector">
              {topManager.tops.map((top) => {
                const isDisabled = !!top.disabled || !isTopAllowed(top)
                return (
                  <button
                    key={top.id}
                    className={`base-item color-item ${selectedTop?.id === top.id ? "selected is-selected" : ""}`}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return
                      topManager.selectTop(top.id)
                    }}
                  >
                    <img src={top.preview} alt={top.name} />
                    <span>{top.name}</span>
                  </button>
                )
              })}
            </div>

            {selectedTop && (
              <div className="dimensions-container">
                <h2 className="top section-anchor" id="step-dimension" style={{ marginTop: 28 }}>Dimensions</h2>

                <div className="dimension-info">
                  <span className="info-icon">!</span>
                  <span>All table heights are fixed between 730mm to 750mm</span>
                </div>

                {selectedTop?.name?.toLowerCase().includes('round') && (
                  <div className="dimension-slider-group">
                    <h3 className="dimension-label">Top Diameter</h3>
                    <div className="slider-controls">
                      <button className="slider-btn minus" onClick={() => topManager.setTopDiameter(topManager.topDiameter - 100)}>-</button>
                      <input
                        type="range"
                        min="1200"
                        max="1580"
                        step="100"
                        value={topManager.topDiameter}
                        onChange={(e) => topManager.setTopDiameter(Number(e.target.value))}
                        className="slider"
                      />
                      <button className="slider-btn plus" onClick={() => topManager.setTopDiameter(topManager.topDiameter + 100)}>+</button>
                    </div>
                    <div className="dimension-value">{topManager.topDiameter}mm</div>
                  </div>
                )}

                {selectedTop?.name?.toLowerCase().includes('square') && (
                  <div className="dimension-slider-group">
                    <h3 className="dimension-label">Top Size</h3>
                    <div className="slider-controls">
                      <button className="slider-btn minus" onClick={() => topManager.setTopSize(topManager.topSize - 100)}>-</button>
                      <input
                        type="range"
                        min="1200"
                        max="1580"
                        step="100"
                        value={topManager.topSize}
                        onChange={(e) => topManager.setTopSize(Number(e.target.value))}
                        className="slider"
                      />
                      <button className="slider-btn plus" onClick={() => topManager.setTopSize(topManager.topSize + 100)}>+</button>
                    </div>
                    <div className="dimension-value">{topManager.topSize}mm</div>
                  </div>
                )}

                {!selectedTop?.name?.toLowerCase().includes('round') && !selectedTop?.name?.toLowerCase().includes('square') && (
                  <>
                    <div className="dimension-slider-group">
                      <h3 className="dimension-label">Top Length</h3>
                      <div className="slider-controls">
                        <button
                          className="slider-btn minus"
                          onClick={() =>
                            topManager.setTopLength(
                              Math.max(minTopLength, topManager.topLength - 100)
                            )
                          }
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min={minTopLength}
                          max="3180"
                          step="20"
                          value={topManager.topLength}
                          onChange={(e) => topManager.setTopLength(Number(e.target.value))}
                          className="slider"
                        />
                        <button
                          className="slider-btn plus"
                          onClick={() => topManager.setTopLength(topManager.topLength + 100)}
                        >
                          +
                        </button>
                      </div>
                      <div className="dimension-value">{topManager.topLength}mm</div>
                    </div>

                    <div className="dimension-slider-group">
                      <h3 className="dimension-label">Top Width</h3>
                      <div className="slider-controls">
                        <button className="slider-btn minus" onClick={() => topManager.setTopWidth(topManager.topWidth - 50)}>-</button>
                        <input
                          type="range"
                          min="800"
                          max="1300"
                          step="50"
                          value={topManager.topWidth}
                          onChange={(e) => topManager.setTopWidth(Number(e.target.value))}
                          className="slider"
                        />
                        <button className="slider-btn plus" onClick={() => topManager.setTopWidth(topManager.topWidth + 50)}>+</button>
                      </div>
                      <div className="dimension-value">{topManager.topWidth}mm</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="chair-selector-container">
            <h2 className="chair section-anchor" id="step-chair">Wear It With</h2>
            {chairManager.chairQuantity > 0 && (
              <div className="chair-seating-type">{seatingTypeLabel}</div>
            )}
            <div className="chair-selector">
              {chairManager.chairs.map((chair) => (
                <button
                  key={chair.id}
                  className={`chair-item ${chairManager.selectedChairId === chair.id ? "active is-selected" : ""}`}
                  disabled={chair.disabled}
                  onClick={() => chairManager.selectChair(chair.id)}
                >
                  <img src={chair.base} alt={chair.name} />
                  <span>{chair.name}</span>
                </button>
              ))}
            </div>

            {selectedChair && (
              <>
                <h2 className="chair" style={{ marginTop: 28 }}>Select Chair Colour</h2>
                <div className="base-selector">
                  {selectedChair.color1 && (
                    <button
                      className={`base-item color-item color-chip ${chairManager.selectedChairColorId === "color1" ? "active is-selected" : ""}`}
                      onClick={() => chairManager.selectChairColor("color1")}
                    >
                      <img src={selectedChair.color1.preview} alt={selectedChair.color1.name} />
                      <span>{selectedChair.color1.name}</span>
                    </button>
                  )}
                  {selectedChair.color2 && (
                    <button
                      className={`base-item color-item color-chip ${chairManager.selectedChairColorId === "color2" ? "active is-selected" : ""}`}
                      onClick={() => chairManager.selectChairColor("color2")}
                    >
                      <img src={selectedChair.color2.preview} alt={selectedChair.color2.name} />
                      <span>{selectedChair.color2.name}</span>
                    </button>
                  )}
                  {selectedChair.color3 && (
                    <button
                      className={`base-item color-item color-chip ${chairManager.selectedChairColorId === "color3" ? "active is-selected" : ""}`}
                      onClick={() => chairManager.selectChairColor("color3")}
                    >
                      <img src={selectedChair.color3.preview} alt={selectedChair.color3.name} />
                      <span>{selectedChair.color3.name}</span>
                    </button>
                  )}
                </div>

                <div className="chair-quantity-container">
                  <h2 className="chair">
                    Select Chair Quantity
                    <span className="info-icon" title="Quantity increases or decreases by 2">!</span>
                  </h2>
                  <div className="quantity-selector">
                    <button
                      className="quantity-btn minus"
                      disabled={chairManager.chairQuantity <= chairManager.chairLimits.min}
                      onClick={() => chairManager.decrementChairQuantity()}
                    >
                      -
                    </button>
                    <span className="quantity-value">{chairManager.chairQuantity}</span>
                    <button
                      className="quantity-btn plus"
                      disabled={chairManager.chairQuantity >= chairManager.chairLimits.max}
                      onClick={() => chairManager.incrementChairQuantity()}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bemade-branding" style={{ marginTop: '20px', paddingBottom: '1px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#111' }}>
                    BeMade<span style={{ fontSize: '12px', verticalAlign: 'super' }}>TM</span>
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span>YOUR DESIGN</span>
                    <span style={{ color: '#ccc' }}>|</span>
                    <span>OUR PERFECTION</span>
                  </div>
                </div>

                <div className="build-summary-container section-anchor" id="step-summary">
                  <h2 className="summary-title">YOUR BUILD</h2>

                  <div className="summary-row">
                    <span className="summary-label">Table Top</span>
                    <span className="summary-value">{selectedTop?.name || "N/A"}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Base</span>
                    <span className="summary-value">{selectedBase?.label || "N/A"}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Base Colour</span>
                    <span className="summary-value">{selectedBase?.color1?.name || "N/A"}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Dimensions</span>
                    <span className="summary-value">
                      {selectedTop?.name?.toLowerCase().includes('round')
                        ? `Diameter: ${topManager.topDiameter}mm`
                        : selectedTop?.name?.toLowerCase().includes('square')
                          ? `Size: ${topManager.topSize}mm`
                          : `${topManager.topLength} x ${topManager.topWidth}mm`
                      }
                    </span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Table Top Shape</span>
                    <span className="summary-value">{selectedTop?.name || "N/A"}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Chair Type</span>
                    <span className="summary-value">{selectedChair?.name || "N/A"}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Chair Colour</span>
                    <span className="summary-value">{chairManager.selectedChairColor?.name || "N/A"}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Chair Quantity</span>
                    <span className="summary-value">{chairManager.chairQuantity}</span>
                  </div>


                  {/* Existing Summary Rows for Specs */}
                  <div className="summary-row">
                    <span className="summary-label">Chair Type</span>
                    <span className="summary-value">{selectedChair?.name || "N/A"}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Chair Colour</span>
                    <span className="summary-value">{chairManager.selectedChairColor?.name || "N/A"}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Chair Quantity</span>
                    <span className="summary-value">{chairManager.chairQuantity}</span>
                  </div>

                  {/* NEW: Price Breakdown Box */}
                  <div className="price-breakdown-box" style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '25px'
                  }}>
                    <div className="summary-row" style={{ marginBottom: '10px' }}>
                      <span className="summary-label">Dining Table</span>
                      <span className="summary-value">£{tablePrice.toFixed(2)}</span>
                    </div>

                    <div className="summary-row" style={{ marginBottom: '10px' }}>
                      <span className="summary-label">Chairs</span>
                      <span className="summary-value">£{chairsTotalPrice.toFixed(2)}</span>
                    </div>

                    <div style={{ borderTop: '1px solid #ddd', margin: '15px 0', paddingTop: '15px' }} className="summary-row">
                      <span className="summary-label" style={{ fontWeight: '100px', fontSize: '1.1rem' }}>Total</span>
                      <span className="summary-value" style={{ fontWeight: '100px', fontSize: '1.1rem' }}>£{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Delivery Info Block */}
                  <div className="delivery-info" style={{
                    backgroundColor: '#e9eff6',
                    padding: '15px',
                    borderRadius: '12px',
                    marginTop: '15px',
                    fontSize: '0.85rem',
                    color: '#555',
                    lineHeight: '1.4'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '5px' }}>Estimated Delivery:</strong>
                    <p>Our products are all unique, made to order and this takes some time in</p>
                    <p>our factory.</p>
                    <p>Once your order has been made, we will notify and arrange delivery with you. </p>
                    <p>Currently the estimated delivery times are within <strong>14-21 days</strong>.</p>
                  </div>

                  <button className="place-order-btn" style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '40px',
                    marginTop: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    letterSpacing: '1px'
                  }}
                    onClick={handlePlaceOrder}
                  >
                    PLACE ORDER
                  </button>
                </div>
              </>
            )}
          </div>



        </>
      )}
    </div>
  )
})

export default BaseSelector
