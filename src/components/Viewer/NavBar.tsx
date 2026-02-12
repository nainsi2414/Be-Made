import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../Styles/NavBar.css"
import { OrderSamples } from "../OrderSamples"

const STEPS = [
  { label: "BASE", id: "step-base" },
  { label: "BASE COLOUR", id: "step-base-colour" },
  { label: "TOP COLOUR", id: "step-top-colour" },
  { label: "TOP SHAPE", id: "step-top-shape" },
  { label: "DIMENSION", id: "step-dimension" },
  { label: "CHAIR", id: "step-chair" },
  { label: "SUMMARY", id: "step-summary" },
]

export const NavBar = () => {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeStep, setActiveStep] = useState("BASE")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const findScrollRoot = () => {
      const explicit = document.getElementById("configurator-scroll") as HTMLElement | null;
      if (explicit) return explicit;
      const base = document.querySelector(".base-selector-container") as HTMLElement | null;
      let el = base?.parentElement ?? null;
      while (el) {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY || style.overflow;
        if (/(auto|scroll)/.test(overflowY)) return el;
        el = el.parentElement;
      }
      return null;
    };

    let scrollRoot = findScrollRoot();
    const getScrollRoot = () => {
      if (scrollRoot) return scrollRoot;
      scrollRoot = findScrollRoot();
      return scrollRoot;
    };
    let rootListener: HTMLElement | null = null;
    let windowListener = false;

    // 1. Handle Scroll class for styling
    const onScroll = () => {
      const top = scrollRoot?.scrollTop ?? window.scrollY;
      setIsScrolled(top > 20);
    };

    // 2. Active step based on scroll position (more reliable than IntersectionObserver)
    const updateActiveStep = () => {
      const root = getScrollRoot();
      const sections = STEPS
        .map((s) => ({ step: s, el: document.getElementById(s.id) }))
        .filter((s): s is { step: { label: string; id: string }, el: HTMLElement } => !!s.el);

      if (sections.length === 0) return;

      const scrollTop = root?.scrollTop ?? window.scrollY;
      const rootTop = root ? root.getBoundingClientRect().top : 0;
      const offset = 120; // tweak if needed for navbar height / spacing

      let current = sections[0].step.label;
      sections.forEach(({ step, el }) => {
        const elTop =
          (root
            ? el.getBoundingClientRect().top - rootTop + scrollTop
            : el.getBoundingClientRect().top + scrollTop);

        if (elTop <= scrollTop + offset) {
          current = step.label;
        }
      });

      setActiveStep(current);
    };

    const onScrollWithActive = () => {
      onScroll();
      updateActiveStep();
    };

    const attachScrollListeners = () => {
      const root = getScrollRoot();
      if (root && rootListener !== root) {
        root.addEventListener("scroll", onScrollWithActive);
        rootListener = root;
      }
      if (!root && !windowListener) {
        window.addEventListener("scroll", onScrollWithActive);
        windowListener = true;
      }
    };

    attachScrollListeners();
    window.addEventListener("resize", updateActiveStep);

    // Initial sync (after render/layout)
    requestAnimationFrame(updateActiveStep);
    setTimeout(() => {
      attachScrollListeners();
      updateActiveStep();
    }, 300);
    setTimeout(() => {
      attachScrollListeners();
      updateActiveStep();
    }, 1000);

    return () => {
      if (rootListener) rootListener.removeEventListener("scroll", onScrollWithActive);
      if (windowListener) window.removeEventListener("scroll", onScrollWithActive);
      window.removeEventListener("resize", updateActiveStep);
    };
  }, []);

  return (
    <>
    <header className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`}>
      {/* LEFT */}
      <div className="navbar__left">
        <img
          src="/assets/images/header_logo.svg"
          alt="BeMade"
          className="navbar__logo"
        />
      </div>

      {/* CENTER */}
      <nav className="navbar__steps">
        {STEPS.map((step) => (
          <button
            key={step.label}
            className={`navbar__step ${
              activeStep === step.label ? "active" : ""
            }`}
            onClick={() => {
              const el = document.getElementById(step.id)
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            }}
          >
            {step.label}
          </button>
        ))}
      </nav>

      {/* RIGHT */}
      <div className="navbar__right">
        <button className="navbar__link-btn" onClick={() => navigate("/auth")}>
          Login / Register
        </button>
        <button className="navbar__cta" onClick={() => setIsModalOpen(true)}>
          Order Sample
        </button>
      </div>
    </header>

    <OrderSamples isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
  </>
  )
}
