"use client"
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'

function Header() {
    const path = usePathname();
    const router =useRouter()
    useEffect(()=>{
        console.log(path)
    },[])
    function getRoutLink(path){
       router.push(path)
    }


  return (
    <div className='flex p-4 items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'>
        <div className='flex items-center space-x-3'>
          <div className='bg-white p-2 rounded-lg'>
            <span className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'>
              🎯
            </span>
          </div>
          <h1 className='text-2xl font-bold text-white'>Interview Prep</h1>
        </div>
      <ul className='hidden md:flex gap-6'>
        <li onClick={()=>getRoutLink('/dashboard')} className={`hover:text-blue-200 hover:font-bold transition-all cursor-pointer text-white ${path=='/dashboard'&&'text-blue-200 font-bold border-b-2 border-blue-200'}`}>Dashboard</li>
      </ul>
      <UserButton/>
    </div>
  )
}

export default Header