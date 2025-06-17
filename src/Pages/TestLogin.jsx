// src/pages/TestLogin.jsx
import React from 'react';
import LoginStep from '../components/LoginStep';

const TestLogin = () => {
  return <LoginStep goToSignup={() => alert('Redirect to Signup')} onLoginSuccess={() => alert('Login success!')} />;
};

export default TestLogin;
