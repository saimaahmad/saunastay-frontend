// src/components/ui/card.jsx
import React from "react";

export const Card = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white shadow rounded-xl p-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardContent = ({ children }) => <div>{children}</div>;
