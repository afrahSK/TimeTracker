import React from 'react'
import img from '../assets/desk.jpg'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
const Home = () => {
  const navigate = useNavigate();
  return (
    <div className='home'>
        {/* <img src={img} alt="img" className='home-img'/> */}
        <div className="bg">
          <p className='home-txt'>Track time efficiently.</p>
          <p className='home-para'>Time tracking with report processing and visualization</p>
          <div className="btns">
            {/* <button className="home-btn" onClick={()=>navigate('/register')}>
                Get started for free
            </button> */}
          </div>
        </div>
    </div>
  )
}

export default Home