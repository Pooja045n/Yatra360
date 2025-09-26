// Simplified placeholder to avoid refactors elsewhere. Always returns light theme.
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({ theme: 'light' });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{ theme: 'light', isDarkMode: false }}>
    {children}
  </ThemeContext.Provider>
);

// Removed ThemeToggle (no-op export for any leftover imports)
export const ThemeToggle = () => null;

export default ThemeProvider;
