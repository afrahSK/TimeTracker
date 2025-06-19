import React,{useEffect, useState} from 'react'
import { supabase } from '../supabase-client.js'
const Account = () => {
  const[session, setSession] = useState(null);
  const[name,setName] = useState('');
  const[email,setEmail] = useState('');
  const[date,setDate] = useState('');
  const[edit,setEdit] = useState(false);
  const getSession = async() => {
    const { data: {user}, error } = await supabase.auth.getUser()
      setSession(user);
      // console.log(user.user_metadata.name);
      // console.log(user.email)
      setName(user.user_metadata.name);
      setEmail(user.email)
      const date = new Date(user.email_confirmed_at);
      const joined = date.toLocaleDateString();
      // console.log(joined)
      setDate(joined);
  }
  useEffect(()=>{
    getSession();
  },[])

  // add updated data
  const updateData = async(name) => {
    const {data,error} = await supabase.auth.updateUser({
      data:{name:name}
    })
    if(error){
      console.log(error)
    }else{
      console.log("data updated sucessfuly");
      alert("profile updated");
    }
  }
  const editProfile = () =>{
    setEdit(true);
  }
  const saveProfile = async() => {
    await updateData(name);
    setEdit(false);
  }
  return (
    <div className='main-about'>
      <div className="personal-details">
        <div className="profile">
          <div className="profile-pic">
          </div>
          <div className="pic-details">
            <p className='profile-name'>{name}</p>
            <div className='editbtns'>
              <button className="edit-profile" onClick={()=>editProfile()}>
              Edit Profile
            </button>
            {
              edit && (
                <button className='edit-profile' onClick={()=>saveProfile()}>Save</button>
              )
            }
            </div>
          </div>
        </div>
        <div className="details">
          <label htmlFor="name">Full Name</label>
          {
            edit?(
              <>
                 <input type="text" name='name' value={name} onChange={(e)=>setName(e.target.value)}/>
              </>
            ):(
              <>
                 <input type="text" name='name' value={name} disabled/>
              </>
            )
          }
          <label htmlFor="email" id='maillabel'>Email</label>
          <input type="email" name='email' value={email}disabled/>
          <p className='date-joined'>Date Joined: {date} </p>
        </div>
      </div>
      <div className="about-right">
          <div className="progress">
            progress
          </div>
          <div className="matrics">
            matrics
          </div>
      </div>
    </div>
  )
}

export default Account