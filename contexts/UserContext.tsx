import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: ImageSourcePropType;
  membershipStatus: string;
}

interface UserContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock users for the hackathon
export const mockUsers: User[] = [
  {
    id: 'user_001',
    name: 'Sophia Carter',
    email: 'sophia.carter@example.com',
    avatar: require('@/assets/images/avatar.png'),
    membershipStatus: 'Premium Member',
  },
  {
    id: 'user_002',
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    avatar: require('@/assets/images/avatar2.png'),
    membershipStatus: 'Basic Member',
  },
  {
    id: 'user_003',
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    avatar: require('@/assets/images/react-logo.png'),
    membershipStatus: 'Premium Member',
  },
  {
    id: 'user_004',
    name: 'Maya Patel',
    email: 'maya.patel@example.com',
    avatar: require('@/assets/images/avatar.png'),
    membershipStatus: 'VIP Member',
  },
];

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isLoggedIn = currentUser !== null;

  return (
    <UserContext.Provider value={{ currentUser, login, logout, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
