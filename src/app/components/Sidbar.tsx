'use client';
import { useState } from 'react';
import { IoMdHome } from 'react-icons/io';
import { CgProfile } from 'react-icons/cg';
import { IoIosSettings } from 'react-icons/io';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaRobot } from 'react-icons/fa6';
import { LuListTodo } from 'react-icons/lu';
import { FiLogOut } from 'react-icons/fi';
import { IoMenu } from 'react-icons/io5';
import { IoCloseOutline } from 'react-icons/io5';
import MenuItem from './SidebarItems';

export default function Sidebar() {
  const [ismenuOpen, setIsMenuOpen] = useState(false);

  // const handleLogout = () => {
  //   //TODO: logout from the app
  // };

  const toggleMenu = () => {
    setIsMenuOpen(!ismenuOpen);
  };

  const menuItems = [
    { label: 'Home', icon: <IoMdHome />, path: '/Home' },
    { label: 'User profile', icon: <CgProfile />, path: '#' },
    { label: 'Setting', icon: <IoIosSettings />, path: '#' },
    { label: 'Calendar', icon: <FaCalendarAlt />, path: '#' },
    { label: 'ChatBot', icon: <FaRobot />, path: '#' },
    { label: 'TODO List', icon: <LuListTodo />, path: '#' },
    { label: 'LogOut', icon: <FiLogOut />, path: '#' },
  ];

  return (
    <div className="relative lg:mr-4 md:mr-2">
      {/* Hamburger menu button for small screens */}
      <div className="fixed top-0 left-0 w-full p-2 bg-blue-500 md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 text-white rounded-md focus:outline-none"
        >
          <IoMenu />
        </button>
      </div>

      {/* Sidebar for small screens */}
      {ismenuOpen && (
        <div className="fixed top-0 left-0 z-50 h-full shadow-lg bg-purple-50 md:hidden">
          <button
            onClick={toggleMenu}
            className="float-right p-3 text-gray-800"
          >
            <IoCloseOutline />
          </button>
          <div className="flex flex-col justify-between h-screen p-4 rounded-2xl">
            {menuItems.map((menuItems, index) => (
              <MenuItem
                key={index}
                label={menuItems.label}
                icon={menuItems.icon}
                path={menuItems.path}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sidebar for large screens */}
      <div className="flex flex-col gap-2 h-screen p-6 ml-2 md:flex lg:w-full bg-purple-50 rounded-2xl">
        {menuItems.map((menuItem, index) => (
          <MenuItem
            key={index}
            label={menuItem.label}
            icon={menuItem.icon}
            path={menuItem.path}
          />
        ))}
      </div>
    </div>
  );
}
