import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='bg-gray-700 text-gray-100 shadow h-14 flex justify-between'>
     <div> <Link to={"/"}>Home</Link></div>
     <div>
      <span><Link to="/:projectId">Task</Link></span>
     </div>
    </div>
  )
}

export default Navbar