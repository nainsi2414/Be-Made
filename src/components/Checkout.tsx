import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { stateManager } from "../managers/StateManager"
import "../Styles/Checkout.css"
import SimpleNavBar from "./Viewer/SimpleNavBar"

const Checkout = observer(() => {
  const navigate = useNavigate()
  const { designManager } = stateManager
  const { baseManager, topManager, chairManager } = designManager

  const selectedTop = topManager.selectedTop
  const selectedBase = baseManager.selectedBase
  const selectedChair = chairManager.selectedChair
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null)
  const [showTerms, setShowTerms] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("checkout_snapshot")
    if (stored) setSnapshotUrl(stored)
  }, [])

  useEffect(() => {
    const root = document.getElementById("root")
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevRootOverflow = root?.style.overflow
    const prevRootHeight = root?.style.height

    document.body.style.overflow = "auto"
    document.documentElement.style.overflow = "auto"
    if (root) {
      root.style.overflow = "auto"
      root.style.height = "auto"
    }

    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      if (root) {
        root.style.overflow = prevRootOverflow ?? ""
        root.style.height = prevRootHeight ?? ""
      }
    }
  }, [])

  // --- PRICING LOGIC ---
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
  const chairUnitPrice = 100; 
  const chairsTotalPrice = chairManager.chairQuantity * chairUnitPrice;
  const grandTotal = tablePrice + chairsTotalPrice;
  // ---------------------

  return (
    <>
    <SimpleNavBar />
    <div className="checkout-page">
      {/* LEFT */}
      <div className="checkout-form-section">
        <h1>Checkout</h1>

        <div className="form-grid">
          <Input label="Full Name" required />
          <Input label="Address Line 1" required />
          <Input label="Address Line 2" />
          <Input label="City" required />
          <Input label="Postcode" required />
          <Input label="County" />
          <Input label="Phone Number" required />
          <Input label="Email Address" required />
        </div>

        <div className="checkout-actions">
          <button className="link-btn" onClick={() => navigate("/")}>
            ‹ Back to Design
          </button>

          <div className="action-buttons">
            <button className="secondary-btn" onClick={() => setShowTerms(true)}>
              Terms & Conditions
            </button>
            <button className="primary-btn">
              Pay Now £{grandTotal.toLocaleString()} ›
            </button>
          </div>
        </div>

        <div className="important-note">
          <strong>IMPORTANT</strong> Due to the bespoke nature of your order,
          we can only provide 48 hours after placing your order where you may
          cancel or make any changes before production begins. After this,
          cancellations and amendments will not be possible.
        </div>
      </div>

      {/* RIGHT */}
      <div className="checkout-summary-section">
        <div className="product-preview">
          {snapshotUrl ? (
            <img src={snapshotUrl} alt="Current table snapshot" />
          ) : null}
        </div>

        <div className="summary-box">
          <h2 className="brand-title">BeMade™</h2>
          <p className="tagline">YOUR DESIGN &nbsp;|&nbsp; OUR PERFECTION</p>

          <h3 className="build-header">YOUR BUILD</h3>

          <div className="specs-list">
            <SummaryRow label="Table Top" value={selectedTop?.name} />
            <SummaryRow label="Base" value={selectedBase?.label} />
            <SummaryRow label="Base Colour" value={selectedBase?.color1?.name} />
            <SummaryRow
              label="Dimensions"
              value={
                selectedTop?.name?.toLowerCase().includes("round")
                  ? `Diameter: ${topManager.topDiameter} mm`
                  : selectedTop?.name?.toLowerCase().includes("square")
                  ? `${topManager.topSize} mm`
                  : `Length: ${topManager.topLength} mm × Width: ${topManager.topWidth} mm`
              }
            />
            <SummaryRow label="Table Top Shape" value={selectedTop?.name} />
            <SummaryRow label="Chair Type" value={selectedChair?.name} />
            <SummaryRow
              label="Chair Colour"
              value={chairManager.selectedChairColor?.name}
            />
            <SummaryRow
              label="Chair Quantity"
              value={chairManager.chairQuantity}
            />
          </div>

          {/* NEW PRICING BREAKDOWN BLOCK */}
          <div className="price-breakdown-section">
            <div className="price-row">
              <span>Dining Table</span>
              <span>£{tablePrice.toLocaleString()}</span>
            </div>
            <div className="price-row">
              <span>Chairs</span>
              <span>£{chairsTotalPrice.toLocaleString()}</span>
            </div>
            <div className="price-row grand-total">
              <strong>Total</strong>
              <strong>£{grandTotal.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {showTerms && (
        <div className="terms-overlay" role="dialog" aria-modal="true">
          <div className="terms-modal">
            <div className="terms-content">
              <p className="last-updated">Last Updated: October 2025</p>
              <p>
                Welcome to Bemade Ltd ("we", "us", "our"). By placing an order or
                using our website <strong>bemade.co.uk</strong>, you agree to
                the following terms.
              </p>
              
              <h3>1. About Us</h3>
              <p>
                Bemade Ltd
                <br />
                107-109 Fletcher Road, Preston, PR1 5AJ
                <br />
                Email: hello@bemade.co.uk
              </p>
              
              <h3>2. Our Products</h3>
              <p>
                We design and supply both bespoke tables (made to your
                specification) and standard items such as chairs and accessories.
              </p>
              <p>
                Every product image and description is prepared carefully, but
                as our materials are natural or handcrafted, slight variations in
                colour, grain, and finish may occur. These are normal and not
                classed as faults.
              </p>
              
              <h3>3. Orders & Payments</h3>
              <ul>
                <li>Full or part payment is required to confirm your order.</li>
                <li>
                  Orders are only accepted once payment is received and you
                  receive written confirmation.
                </li>
                <li>
                  For bespoke items, production begins once your final design and
                  payment are confirmed.
                </li>
                <li>Payments are processed securely through trusted providers.</li>
              </ul>
              <p>
                <em>
                  Important: Because all bespoke items are custom-made for you,
                  they cannot be cancelled or refunded once production has
                  started, except in limited cases below (see Section 4). This
                  condition is clearly stated before checkout and helps protect
                  both you and us under UK law, including Section 75 of the
                  Consumer Credit Act.
                </em>
              </p>

              <h3>4. Refunds, Returns & Cancellations</h3>
              <p>
                <strong>Bespoke tables:</strong>
              </p>
              <ul>
                <li>You have 24 hours after placing your order to request changes or cancellation.</li>
              </ul>
            </div>

            <div className="terms-actions">
              <button className="secondary-btn" onClick={() => setShowTerms(false)}>
                Decline
              </button>
              <button className="primary-btn" onClick={() => setShowTerms(false)}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
})

const Input = ({ label, required }: { label: string; required?: boolean }) => (
  <div className="input-group">
    <label>
      {label} {required && <span>*</span>}
    </label>
    <input placeholder={`Enter ${label.toLowerCase()}`} />
  </div>
)

const SummaryRow = ({ label, value }: { label: string; value?: any }) => (
  <div className="summary-row">
    <span className="row-label">{label}</span>
    <span className="row-value">{value || "N/A"}</span>
  </div>
)

export default Checkout
