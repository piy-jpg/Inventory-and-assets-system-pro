const User = require('../models/User');

const getCurrentUser = async (authUser) => {
  if (!authUser) {
    return null;
  }

  if (authUser._id) {
    return User.findById(authUser._id);
  }

  if (authUser.user_id) {
    return User.findOne({ user_id: authUser.user_id });
  }

  if (authUser.email) {
    return User.findOne({ email: authUser.email });
  }

  return null;
};

const getCurrentUserId = async (authUser) => {
  const user = await getCurrentUser(authUser);
  return user?._id || null;
};

module.exports = {
  getCurrentUser,
  getCurrentUserId,
};
