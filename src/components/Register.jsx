import React from 'react'
import { useRef, useState } from "react";
import {supabase} from "../supabase-client";
const Register = ({ isOpen, onClose, switchToLogin }) => {

  
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("working");
    const {error: signUpError} = await supabase.auth.signUp({email, password,
      options:{
        data:{
          name:name
        }
      }
    });
    if(signUpError){
      console.log("Error signing up:", signUpError.message);
      return;
    }
    console.log("after signup")

  }
  if (!isOpen) return null;
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
                value={name}
                onChange={(e)=>setName(e.target.value)}
                required
              />
            
            <input
              className="inp"
              type="email"
              placeholder="Email*"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
            <input
              className="inp"
              type="password"
              placeholder="Password*"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />
            </div>
            <div className="terms">
              <input type="checkbox" className="cb-terms" required />
              <p>I agree to the Terms of Service and Privacy Policy.</p>
            </div>

            <button type="submit" className="btn-register">Create account</button>
            <p>Already have an account?</p>
            <a className="a-login" style={{ cursor: "pointer", color: "blue" }} onClick={switchToLogin}>Login</a>
          </form>
        </div>
      </div>
    </>
  )
}

export default Register