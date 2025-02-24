// context/CollapsedContext.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CollapsedContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const CollapsedContext = createContext<CollapsedContextType | undefined>(undefined);
console.log(2613)
export const CollapsedProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState<boolean>(true);

  return (
    <CollapsedContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </CollapsedContext.Provider>
  );
};

export const useCollapsedContext = (): CollapsedContextType => {
  console.log(112613)
  const context = useContext(CollapsedContext);
  if (!context) {
    throw new Error('useCollapsedContext must be used within a CollapsedProvider');
  }
  return context;
};