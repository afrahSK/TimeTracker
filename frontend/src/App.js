import React from 'react'
import Navbar from './components/Navbar.jsx'
import Track from './components/Track.jsx'
import TrackDummy from './components/TrackDummy.jsx'
import Register from './components/Register.jsx'
import Reports from './components/Reports.jsx'
import Home from './components/Home.jsx'
import Account from './components/Account.jsx'
import MyActivities from './components/MyActivities.jsx'
import { useState, useEffect } from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom";
import {supabase} from './supabase-client.js'
import './App.css'
import Sidebar from './components/Sidebar.jsx'
const App = () => {

  
  return (
    <div>
      <BrowserRouter>
        <Navbar/>
      <div className='left' style={{ display: 'flex' }}>
        <Sidebar/>
        <div style={{ flex: 1, padding: '20px',minWidth: '100vh' }}>
            <Routes>
          <Route path='/' element={<Track/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/track' element={<Track/>}/>
          <Route path='/MyActivities' element={<MyActivities/>}/>
          <Route path='/Account' element={<Account/>}/>
          <Route path='/Reports' element={<Reports/>}/>
        </Routes>
        </div>
      </div>
      </BrowserRouter>
    </div>
  )
}

export default App