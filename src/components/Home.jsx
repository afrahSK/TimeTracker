import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar';

const Home = ({session}) => {
  const navigate = useNavigate();
  return (
    <div className='home'>
      <Navbar session={session} />
      <div className='main-content'>
          <div className="left-img">
           <p>Track time effortlessly</p>
          </div>
      </div>
    </div>
  )
}

export default Home
