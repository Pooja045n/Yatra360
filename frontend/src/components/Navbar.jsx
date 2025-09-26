import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FcGlobe } from "react-icons/fc";
import { RiCompassDiscoverFill } from "react-icons/ri";
import { FaPersonRays } from "react-icons/fa6";
import { MdPlace } from "react-icons/md";
import { MdOutlineFestival } from "react-icons/md";
import { FaHandshake } from "react-icons/fa";
import { MdPriceChange } from "react-icons/md";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { FaSearchLocation } from "react-icons/fa";
import { IoLogIn } from "react-icons/io5";
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import "./Navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [profileOpen]);

  const initials = user?.name?.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase() || user?.username?.[0]?.toUpperCase() || null;

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}

      <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <FcGlobe size={30} />
          <span className="logo-text">Yatra360</span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <NavLink to="/explore" className="nav-link"><RiCompassDiscoverFill size={20} /> <br />Explore</NavLink>
          <NavLink to="/places" className="nav-link"><MdPlace size={20} /><br /> Places</NavLink>
          <NavLink to="/guides" className="nav-link"><FaPersonRays size={20} /> Guides</NavLink>
          <NavLink to="/festivals" className="nav-link"><MdOutlineFestival size={20} /> Festivals</NavLink>
          <NavLink to="/connect" className="nav-link"><FaHandshake size={20} /> Connect</NavLink>
          <NavLink to="/budget" className="nav-link"><MdPriceChange size={20} /> Budget</NavLink>
          <NavLink to="/alerts" className="nav-link"><TbAlertTriangleFilled size={20} /> Alerts</NavLink>

        </div>

        {/* Right Buttons */}
        <div className="navbar-actions">
          <button className="icon-btn"><FaSearchLocation size={20} /></button>
          {!user ? (
            <NavLink to="/login" className="nav-link"><IoLogIn size={20}/>Login</NavLink>
          ) : (
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="profile-trigger"
                onClick={() => setProfileOpen(o=>!o)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                {initials ? (
                  <span className="avatar-circle" aria-label={`User ${user.name || user.username}`}>{initials}</span>
                ) : (
                  <FaUserCircle size={28} />
                )}
              </button>
              {profileOpen && (
                <div className="profile-menu" role="menu">
                  <div className="profile-info">
                    <div className="profile-name">{user.name || user.username || 'User'}</div>
                    {user.email && <div className="profile-email">{user.email}</div>}
                  </div>
                  <NavLink to="/profile" className="profile-item" role="menuitem" onClick={()=>setProfileOpen(false)}>Profile</NavLink>
                  <NavLink to="/itinerary" className="profile-item" role="menuitem" onClick={()=>setProfileOpen(false)}>My Itineraries</NavLink>
                  <NavLink to="/bookmarks" className="profile-item" role="menuitem" onClick={()=>setProfileOpen(false)}>Bookmarks</NavLink>
                  <button className="profile-item logout" role="menuitem" onClick={handleLogout}><FaSignOutAlt/> Logout</button>
                </div>
              )}
            </div>
          )}
          <button className="menu-toggle" onClick={() => setMenuOpen(true)}>☰</button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setMenuOpen(false)}>×</button>
        <NavLink to="/explore" onClick={() => setMenuOpen(false)}><RiCompassDiscoverFill size={20} /> Explore</NavLink>
        <NavLink to="/places" onClick={() => setMenuOpen(false)}><MdPlace size={20} /> Places</NavLink>
        <NavLink to="/guides" onClick={() => setMenuOpen(false)}><FaPersonRays size={20} /> Guides</NavLink>
        <NavLink to="/festivals" onClick={() => setMenuOpen(false)}><MdOutlineFestival size={20} /> Festivals</NavLink>
        <NavLink to="/connect" onClick={() => setMenuOpen(false)}><FaHandshake size={20} /> Connect</NavLink>
        <NavLink to="/budget" onClick={() => setMenuOpen(false)}><MdPriceChange size={20} /> Budget</NavLink>
        <NavLink to="/alerts" onClick={() => setMenuOpen(false)}><TbAlertTriangleFilled size={20} /> Alerts</NavLink>
        {!user && <NavLink to="/login" onClick={() => setMenuOpen(false)}><IoLogIn size={20}/> Login</NavLink>}
        {user && <NavLink to="/profile" onClick={() => setMenuOpen(false)}><FaUserCircle size={20}/> Profile</NavLink>}
        {user && <button className="mobile-logout" onClick={()=>{ handleLogout(); setMenuOpen(false); }}><FaSignOutAlt/> Logout</button>}
      </div>
    </>
  );
};

export default Navbar;
