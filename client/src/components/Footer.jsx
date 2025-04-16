import React from 'react'
import copyrightSign from "../asserts/icons/copyright-sign.svg";
import FMLogo from "../asserts/icons/FMLogo.png"; 
import facebook from "../asserts/icons/facebook.svg";
import instagram from "../asserts/icons/instagram.svg";
import twitter from "../asserts/icons/twitter.svg";

const socialMedia = [
  { src: facebook, alt: "facebook logo" },
  { src: twitter, alt: "twitter logo" },
  { src: instagram, alt: "instagram logo" },
];

const Footer = () => {
  return (
        <footer className='bg-orange-500 text-white font-bold text-center p-4 mt-0'>
            <div className='flex justify-between items-start gap-20 flex-wrap max-lg:flex-col mr-20 ml-20'>
                <div className='flex flex-col items-start'>
                    <a href='https://res.cloudinary.com/fmart/image/upload/v1743634267/FMLogo_nktw1c.png' className='flex font-semibold font-montserrat leading-normal items-center text-xl text-coral-red ' >
                        <img src={ FMLogo } alt='logo' width={200} height={200} /> 
                    </a>
                    <div className='flex items-center gap-7 mt-4'>
                      {socialMedia.map((icon) => (
                        <div
                          className='flex justify-center items-center w-12 h-12 bg-white rounded-2xl'
                          key={icon.alt}
                        >
                        <a href='https://res.cloudinary.com/fmart/image/upload/v1743634267/FMLogo_nktw1c.png'>
                          <img src={icon.src} alt={icon.alt} width={24} height={24} />
                        </a>
                        </div>
                      ))}
                    </div> 
                </div>
                <div className='flex flex-col items-start mt-4'>
                  <h2 className='text-white font-semibold font-montserrat text-xl'>Opening Hours</h2>
                  <p className='text-white font-montserrat mt-5 text-lg'>Monday to Friday</p>
                  <p className='text-white font-montserrat mt-0 text-lg'>9:00am - 5:00pm</p>
                  <p className='text-white font-montserrat mt-5 text-lg'>Saturday</p>
                  <p className='text-white font-montserrat mt-0 text-lg'>9:00am - 3:00pm</p>
                </div>
                <div className='flex flex-col items-start mt-4'>
                  <h2 className='text-white font-semibold font-montserrat text-xl'>Company</h2>
                  <p className='text-white font-montserrat mt-5 text-lg'>No:257, Colombo rd, Peradeniya</p>
                </div> 
                <div className='flex flex-col items-start mt-4 mr-8'>
                  <h2 className='text-white font-semibold font-montserrat text-xl'>Contact Us</h2>
                  <p className='text-white font-montserrat mt-5 text-lg'>0812 387 757</p>
                  <p className='text-white font-montserrat text-lg'>0716 635 635</p>
                  <p className='text-white font-montserrat text-lg'>0771 010 885</p>  
                </div>        
            </div>
            <div className='flex justify-between text-white-400 mt-10 max-sm:flex-col max-sm:items-center'>
              <div className='flex flex-1 justify-start items-center gap-2 font-montserrat cursor-pointer'>
                <img
                  src={copyrightSign}
                  alt='copyright sign'
                  width={20}
                  height={20}
                  className='rounded-full m-0 '
                />
                <p>Copyright. All rights reserved.</p>
              </div>
                <p className='font-montserrat cursor-pointer'>Terms & Conditions</p>
            </div>
        </footer>
  )
}

export default Footer
