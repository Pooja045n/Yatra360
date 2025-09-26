import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import ScrollingAlerts from './components/ScrollingAlerts';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import { useLocation } from 'react-router-dom';
import './styles/DesignSystem.css';
import './components/ui/ProfessionalComponents.css';
import './styles/Theme.css';
import './styles/tricolor-theme.css';

const App = () => {
  const location = useLocation();

  // Apply a global background image class to body for all routes except /login
  useEffect(() => {
    const body = document.body;
    if (location.pathname !== '/login') {
      body.classList.add('global-bg');
      body.classList.add('bg-loading');

      const fullUrl = process.env.PUBLIC_URL + '/images/background.jpg';
      const mobileUrl = process.env.PUBLIC_URL + '/images/background-mobile.jpg';

      // Base64 ultra-low-res placeholder (1x1 dark pixel) - can be replaced with real tiny preview later
      const placeholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDABALDA4MChAODQ4SERATGCgaGBgYGi0mJiIjLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL//AABEIAAEAAQMBEQACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAABf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAAP8A/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyA//8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPwAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPwAf/9k=';
      body.style.setProperty('--global-bg-current', `url(${placeholder})`);
  body.style.setProperty('--global-bg-mobile-current', `url(${placeholder})`);
      body.style.setProperty('--global-bg-image', `url(${fullUrl})`);
      body.style.setProperty('--global-bg-mobile', `url(${mobileUrl})`);

      // Decide which target image should replace placeholder based on viewport
      const useMobile = window.matchMedia('(max-width: 768px)').matches;
      const target = new Image();
      target.onload = () => {
        // Swap to loaded image
        if (useMobile) {
          body.style.setProperty('--global-bg-mobile-current', `url(${mobileUrl})`);
          body.style.setProperty('--global-bg-current', `url(${mobileUrl})`);
        } else {
          body.style.setProperty('--global-bg-current', `url(${fullUrl})`);
        }
        body.classList.remove('bg-loading');
        body.classList.add('bg-ready');
      };
      target.onerror = () => {
        // Fallback: just show color
        body.classList.remove('bg-loading');
        body.classList.add('bg-ready');
      };
      target.src = useMobile ? mobileUrl : fullUrl;

    } else {
      body.classList.remove('global-bg', 'bg-loading', 'bg-ready');
      body.style.removeProperty('--global-bg-image');
      body.style.removeProperty('--global-bg-mobile');
      body.style.removeProperty('--global-bg-current');
      body.style.removeProperty('--global-bg-mobile-current');
    }
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <AuthProvider>
      <div className={"App" + (isAdminRoute ? ' admin-isolated' : '')}>
        {!isAdminRoute && <Navbar />}
        {!isAdminRoute && <ScrollingAlerts />}
        <AppRoutes />
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <AIAssistant />}
      </div>
    </AuthProvider>
  );
};

export default App;