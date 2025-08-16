import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar';
import '../home.css'
const Home = ({ session }) => {
  const navigate = useNavigate();
  return (
    <div className='home'>
      <Navbar session={session} />
      <div className='main-content'>
        <div className="left-img">
          <p className='main-p'>Track time effortlessly</p>
          <p className='sub-p'>Track your time. Boost your productivity.</p>
          <div className="home-btns">
            <button className="btn-started">Get started</button>
            <button className="btn-demo">Watch Demo</button>
          </div>
          <div className="right-img">
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
