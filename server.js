const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static HTML/CSS files from current directory
app.use(express.static(path.join(__dirname)));

// MongoDB Connection (Local or Atlas)
const MONGO_URI = 'mongodb://127.0.0.1:27017/einstein_books';

mongoose.connect(MONGO_URI)
  .then(() => console.log(' Connected to MongoDB successfully!'))
  .catch(err => console.error(' MongoDB connection error:', err));

// Student Schema & Model
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    course: { type: String, required: true },
    city: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Student = mongoose.model('Student', studentSchema);

// Registration Endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { name, age, course, city, email, password } = req.body;
        
        // Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.json({ success: false, message: 'Email already registered! Please login.' });
        }

        const newStudent = new Student({ name, age, course, city, email, password });
        await newStudent.save();

        res.json({ success: true, message: 'Registration Successful! Please login now.' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const student = await Student.findOne({ email, password });
        if (!student) {
            return res.json({ success: false, message: 'Invalid email or password!' });
        }

        res.json({ 
            success: true, 
            message: 'Login successful', 
            student: {
                name: student.name,
                email: student.email,
                city: student.city,
                course: student.course
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
    console.log(` Open website: http://localhost:3000/login.html`);
});