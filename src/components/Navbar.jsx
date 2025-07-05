import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Sidebar from './Sidebar'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase-client.js';
const Navbar = ({session}) => {
  const navigate = useNavigate();
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);

  const openRegister = () => {
    setRegisterOpen(true);
  }
  const closeRegister = () => {
    setRegisterOpen(false);
  }
  const openLogin = () => {
    setLoginOpen(true);
  }
  const closeLogin = () => {
    setLoginOpen(false);
  }
  const hangleLoginSuccess = () => {
    closeLogin();
    navigate('/track');
  }
  const handleLogout = async () => {
    await supabase.auth.signOut();
  }
  return (
    <>
      <div className='nav'>
        <div className='logo'>
          <span>Tracklify</span>
        </div>
        <div className="nav-items">
        </div>
        <div className="auth">
          {
            session ? (
              
              <>
                <button className="btn-auth" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn-auth" onClick={openRegister}>
                  Register
                </button>
              </>
            )
          }

        </div>
        <Register
          isOpen={isRegisterOpen}
          onClose={closeRegister}
          switchToLogin={() => {
            closeRegister();
            openLogin();
          }}
        />

        <Login
          isOpen={isLoginOpen}
          onClose={closeLogin}
          switchToRegister={
            () => {
              closeLogin();
              openRegister();
            }
          }
          onLoginSuccess={hangleLoginSuccess}
        />
      </div>
    </>
  )
}

export default Navbar