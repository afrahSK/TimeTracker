import React,{useState} from 'react'
import Home from './Home.jsx'
import Track from './Track.jsx'
import Register from './Register.jsx'
import './App.css'
import {BrowserRouter,Routes,Route} from "react-router-dom";
const App = () => {
  
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/track' element={<Track/>}/>
          <Route path='/register' element={<Register/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App