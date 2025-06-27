import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface AppContextType {
  userIdentifier: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  // Generate or retrieve user identifier
  const getUserIdentifier = () => {
    const identifier = localStorage.getItem('user_identifier');
    if (!identifier) {
      const newIdentifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_identifier', newIdentifier);
      return newIdentifier;
    }
    return identifier;
  };

  const userIdentifier = getUserIdentifier();

  return (
    <AppContext.Provider value={{ userIdentifier }}>
      {children}
    </AppContext.Provider>
  );
};