import React,{useState} from 'react'
import {Link} from 'react-router-dom';
import Register from './Register';
const Home = () => {
  const [isRegisterOpen,setRegisterOpen] = useState(false);
  const openRegister = () =>{
    setRegisterOpen(true);
  }
  const closeRegister = () => {
    setRegisterOpen(false);
  }
  return (
    <>
      <div className='nav'>
        <div className='logo'>
          Time<span>Tracker</span>
        </div>
        <div className="nav-items">
        <Link className='link' to='/'><li>Home</li></Link>
        <Link className='link' to='/track'><li>Start Tracking</li></Link>
        <Link className='link' to='/track'><li>View Reports</li></Link>
        </div>
        <div className="auth">
            <button className="btn-auth" onClick={openRegister}>Register</button>
        </div>
        <Register
        isOpen = {isRegisterOpen}
        onClose = {closeRegister}
        />
      </div>
    </>
  )
}

export default Home