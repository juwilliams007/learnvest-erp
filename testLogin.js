const axios = require('axios');
require('dotenv').config();

// Test backend connectivity and create admin user if needed
const API_URL = process.env.API_URL || 'https://learnvest-erp.onrender.com/api';

async function testBackend() {
  console.log('🔍 Testing backend at:', API_URL);
  console.log('');

  // Test 1: Check if backend is responding
  try {
    console.log('Test 1: Checking if backend API is responding...');
    const res = await axios.get(`${API_URL}`);
    console.log('✅ Backend is responding:', res.data);
  } catch (err) {
    console.log('❌ Backend not responding:', err.message);
    console.log('   Make sure the backend is deployed on Render');
    return;
  }

  console.log('');

  // Test 2: Try to register an admin user (will fail if already exists)
  try {
    console.log('Test 2: Creating admin user...');
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Admin User',
      email: 'admin@learnvest.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Admin user created:', res.data);
    console.log('   Email: admin@learnvest.com');
    console.log('   Password: admin123');
  } catch (err) {
    if (err.response?.status === 400) {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.log('❌ Error creating admin:', err.response?.data || err.message);
    }
  }

  console.log('');

  // Test 3: Try to login as admin
  try {
    console.log('Test 3: Testing login...');
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@learnvest.com',
      password: 'admin123'
    });
    console.log('✅ Login successful!');
    console.log('   User:', res.data.name);
    console.log('   Role:', res.data.role);
    console.log('   Token:', res.data.token.substring(0, 20) + '...');
  } catch (err) {
    console.log('❌ Login failed:', err.response?.data || err.message);
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('💡 Try logging in with:');
  console.log('   Email: admin@learnvest.com');
  console.log('   Password: admin123');
  console.log('='.repeat(50));
}

testBackend();
