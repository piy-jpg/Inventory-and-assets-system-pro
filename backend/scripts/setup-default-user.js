const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const setupDefaultUser = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.abcde.mongodb.net/smart-inventory?retryWrites=true&w=majority';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ username: 'jaanu@1' });
    if (existingUser) {
      console.log('User jaanu@1 already exists');
      await mongoose.connection.close();
      return;
    }

    // Create default user
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const defaultUser = new User({
      user_id: `USR_${Date.now()}`,
      username: 'jaanu@1',
      email: 'jaanu@example.com',
      password: hashedPassword,
      firstName: 'Jaanu',
      lastName: 'User',
      role: 'admin',
      department: 'IT',
      phone: '+1234567890',
      isActive: true,
      permissions: [
        'inventory_read', 'inventory_write',
        'assets_read', 'assets_write',
        'transactions_read', 'transactions_write',
        'reports_read', 'reports_write',
        'users_read', 'users_write',
        'settings_read', 'settings_write'
      ]
    });

    await defaultUser.save();
    console.log('Default user created successfully:');
    console.log('Username: jaanu@1');
    console.log('Password: 123456');
    console.log('Role: admin');

    await mongoose.connection.close();
    console.log('Setup completed');
  } catch (error) {
    console.error('Error setting up default user:', error);
    process.exit(1);
  }
};

setupDefaultUser();
