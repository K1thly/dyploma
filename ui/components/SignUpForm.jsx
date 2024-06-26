import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: formData.userName,
          password: formData.password,
          email: formData.email,
        }),
      });
      console.log(response);
      if (response.ok) {
        setSuccess('Account created successfully');
        navigate('/signin');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error creating account');
      }
    } catch (error) {
      setError('Error creating account');
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-900 pt-16">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-white">Sign up for free</h2>
        <div className="mb-4 text-center">
          <a className="text-sm text-gray-400 hover:text-gray-300 underline" href="/signin">
            or sign in to your existing account
          </a>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="flex text-gray-400 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex text-gray-400 text-sm font-bold mb-2" htmlFor="userName">
              Username
            </label>
            <input
              className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:shadow-outline"
              id="userName"
              type="text"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex text-gray-400 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex text-gray-400 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="w-full bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 focus:outline-none focus:shadow-outline font-bold"
            type="submit"
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
