const supabase = require('../supabaseClient');
const bcrypt = require('bcrypt');

// Register a new user
const createUser = async (user) => {
  const { username, email, password } = user;

  // Hash the password before storing it in Supabase
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([
      { username, email, password: hashedPassword, created_at: new Date() }
    ])
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Validate user credentials (login)
const validateUser = async (email, password) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, data.password);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return data;
};

module.exports = {
  createUser,
  validateUser,
};