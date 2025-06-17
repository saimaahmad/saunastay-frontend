  // src/context/SaunaContext.js
  import React, { createContext, useState } from 'react';

  export const SaunaContext = createContext();

  export const SaunaProvider = ({ children }) => {
    const [saunaName, setSaunaName] = useState('');

    return (
      <SaunaContext.Provider value={{ saunaName, setSaunaName }}>
        {children}
      </SaunaContext.Provider>
    );
  };
