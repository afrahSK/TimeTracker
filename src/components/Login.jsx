import React, { useState } from 'react'
import {supabase} from '../supabase-client'
const Login = ({isOpen,onClose,switchToRegister, onLoginSuccess}) => {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const handleSubmit = async(e) =>{
    e.preventDefault();
    const {error:signinError} = await supabase.auth.signInWithPassword({email,password});
    if(signinError){
      console.log("error:",signinError.message);
    }
    else{
      onClose();
      onLoginSuccess(email);
    }
  }
  if (!isOpen) return null;
  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>✖</button>
          <h2>Login in</h2>

          <form onSubmit={handleSubmit} className="form register-form">
            <div className="form-group">
            
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

            <button type="submit" className="btn-register">Login</button>
            <p>Don't have an account?</p>
            <a className="a-login" style={{ cursor: "pointer", color: "blue" }} onClick={switchToRegister}>Register now</a>
          </form>  
        </div>
      </div>
    </>
  )
}

export default Login