import React,{useState} from 'react'

const Register = ({isOpen, onClose}) => {
  const [formData, setFormData] = useState({
      name : "",
      email : "",
      password : ""
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("working");
  }
  if(!isOpen) return null;
  return (
    <>
        <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Sign up</h2>

        <form onSubmit={handleSubmit} className="form register-form">
          <div className="form-group">
            <input
              className="inp"
              type="text"
              placeholder="Name*"
              required
            />
          </div>
          <input
            className="inp"
            type="email"
            placeholder="Email*"
            required
          />
          <input
            className="inp"
            type="password"
            placeholder="Password*"
            required
          />

          <div className="terms">
            <input type="checkbox" className="cb-terms" required />
            <p>I agree to the Terms of Service and Privacy Policy.</p>
          </div>

          <button type="submit" className="btn register-btn">Create account</button>
          <p>Already have an account?</p>
          <a className="a-login" style={{ cursor: "pointer", color: "blue" }}>Login</a>
        </form>
      </div>
    </div>
    </>
  )
}

export default Register