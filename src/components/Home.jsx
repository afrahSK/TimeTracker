import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className='home'>
      <div className="overlay">
        <h1 className="title">Track Time Efficiently.</h1>
        <p className="subtitle">Boost productivity with tracking, scheduling, and visualization tools.</p>

        {/* Animated Stats */}
        {/* <div className="stats">
          <div className="stat-card">10+ Users</div>
          <div className="stat-card">⏱ 1M+ Hours Tracked</div>
          <div className="stat-card">📊 500K+ Tasks Completed</div>
        </div> */}

        {/* Feature Grid */}
        <div className="features">
          <div className="feature-card">⏰ Time Tracking</div>
          <div className="feature-card">🍅 Pomodoro Timer</div>
          <div className="feature-card">📝 To-Do Manager</div>
          <div className="feature-card">📈 Graph Visualization</div>
          <div className="feature-card">📅 Task Scheduling</div>
        </div>

        {/* CTA Button */}
        {/* <button className="home-btn" onClick={() => navigate('/register')}>Get Started for Free</button> */}
      </div>
    </div>
  )
}

export default Home
