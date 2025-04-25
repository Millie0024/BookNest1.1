// server.js
import express, { json } from 'express';
import { connect } from 'mongoose';
import { genSalt, hash } from 'bcrypt';
import User, { findOne } from './models/User';

const app = express();
const PORT = 5000;

// Connect to the database
connect('mongodb://localhost/booknest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(json());

// Sign Up endpoint
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});