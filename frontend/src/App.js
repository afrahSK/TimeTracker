import React from 'react'
import Home from './Home.jsx'
import Track from './Track.jsx'
import Register from './Register.jsx'
import { useState, useEffect } from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom";
import {supabase} from './supabase-client.js'
import './App.css'
const App = () => {

  const [session,setSession] = useState(null);

  const fetchSession = async()=>{
    const currentSession = await supabase.auth.getSession()
    console.log(currentSession);
    setSession(currentSession.data);
  }

  useEffect(()=>{
    fetchSession();

    const {}= supabase.auth.onAuthStateChange(_event, session) => {

    }
  }, []);

  const logout = async() =>{
    await supabase.auth.signOut();
  }
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