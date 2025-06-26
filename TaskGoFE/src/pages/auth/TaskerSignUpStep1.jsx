import React, { useState } from 'react';
import { FaGoogle, FaApple, FaFacebook } from 'react-icons/fa';

const TaskerSignUpStep1 = ({ onNext, initialData = {} }) => {
  const [form, setForm] = useState({
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setError('');
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.agreedToTerms) {
      setError('You must agree to the Terms and Privacy Policy.');
      return;
    }
    onNext({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Create your account as a <span className="text-blue-600">Tasker</span></h2>
        <p className="text-center text-sm text-gray-600 mt-2">It's free and easy</p>
      </div>
      <form className="space-y-6" onSubmit={handleNext}>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Full name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">E-mail</label>
          <input
            type="email"
            name="email"
            placeholder="Type your e-mail"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Phone</label>
          <input
            type="text"
            name="phone"
            placeholder="Type your phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Type your password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition"
            required
          />
          <span className="text-xs text-gray-400">Must be 8 characters at least</span>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 transition"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="agreedToTerms"
            name="agreedToTerms"
            type="checkbox"
            checked={form.agreedToTerms}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="agreedToTerms" className="text-sm text-gray-600">
            By creating an account means you agree to the <a href="/terms" className="underline">Terms and Conditions</a>, and our <a href="/privacy" className="underline">Privacy Policy</a>
          </label>
        </div>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <button type="submit" className="w-full py-3 rounded-full bg-black text-white font-semibold hover:bg-gray-900 transition">Next</button>
      </form>
      <div className="flex justify-center gap-4 mt-6">
        <button type="button" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"><FaGoogle className="w-6 h-6" /></button>
        <button type="button" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"><FaApple className="w-6 h-6" /></button>
        <button type="button" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"><FaFacebook className="w-6 h-6" /></button>
      </div>
      <div className="text-center text-sm mt-4">
        Already have an account? <a href="/login" className="font-semibold text-black">Sign In</a>
      </div>
    </div>
  );
};

export default TaskerSignUpStep1; 