const supabase = require('../supabaseClient');
const bcrypt = require('bcrypt');

// Get all users
const getAllUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*'); // Fetch all columns
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data;
};

// Register a new user
const createUser = async (user) => {
  const { username, email, password, first_name, last_name } = user;

  // Hash the password before storing it in Supabase
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([
      { 
        username, 
        email, 
        password: hashedPassword, 
        first_name, 
        last_name, 
        created_at: new Date() 
      }
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
      console.error("User not found or error querying database:", error); // Log error if user is not found or database query fails
      throw new Error('Invalid email or password');
    }
  
    // Compare hashed password
    const isMatch = await bcrypt.compare(password, data.password);
  
    if (!isMatch) {
      console.error("Password mismatch"); // Log if password doesn't match
      throw new Error('Invalid email or password');
    }
  
    return data; // Return user data if credentials match
};

module.exports = {
  getAllUsers,
  createUser,
  validateUser,
};