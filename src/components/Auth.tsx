import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../Styles/Auth.css"
import SimpleNavBar from "./Viewer/SimpleNavBar"

const Auth = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)

  const isLogin = mode === "login"

  return (
    <>
      <SimpleNavBar />
      <div className="auth-page">
        <div className="auth-card">
          <button className="auth-back" onClick={() => navigate("/")}>
            Back
          </button>

        <h1>{isLogin ? "Login" : "Register"}</h1>

        <div className="auth-field">
          <label>
            <span className="auth-required">*</span>Email
          </label>
          <input type="email" placeholder="Enter email" />
        </div>

        <div className="auth-field">
          <label>
            <span className="auth-required">*</span>Password
          </label>
          <div className="auth-input-with-icon">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
            />
            <button
              className="auth-eye"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Toggle password visibility"
              type="button"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div className="auth-field">
            <label>
              <span className="auth-required">*</span>Confirm Password
            </label>
            <input type="password" placeholder="Confirm password" />
          </div>
        )}

        <button className="auth-submit">{isLogin ? "Login" : "Sign Up"}</button>

        <p className="auth-toggle">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            className="auth-link"
            onClick={() => setMode(isLogin ? "register" : "login")}
            type="button"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
      </div>
    </>
  )
}

export default Auth
