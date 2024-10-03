const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/SriTanujaPG', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

// Define storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Create multer instance
const upload = multer({ storage: storage });

// Define a Mongoose schema and model
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    occupation: { type: String, required: true },
    pgSelection: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    parentsNumber: { type: String, required: true },
    workAddress: { type: String, required: true },
    guardianAddress: { type: String, required: true },
    passportPhoto: { type: String },
    aadhaarProof: { type: String }
});

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the registration form at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});

// Handle form submission with file uploads
app.post('/register', upload.fields([
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'aadhaarProof', maxCount: 1 }
]), async (req, res) => {
    console.log('req.body:', req.body); // Debugging
    console.log('req.files:', req.files); // Debugging

    try {
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobileNumber: req.body.mobileNumber,
            email: req.body.email,
            occupation: req.body.occupation,
            pgSelection: req.body.pgSelection,
            permanentAddress: req.body.permanentAddress,
            parentsNumber: req.body.parentsNumber,
            workAddress: req.body.workAddress,
            guardianAddress: req.body.guardianAddress,
            passportPhoto: req.files['passportPhoto'] ? req.files['passportPhoto'][0].filename : null,
            aadhaarProof: req.files['aadhaarProof'] ? req.files['aadhaarProof'][0].filename : null
        });

        await newUser.save();
        res.send('User registered successfully!');
    } catch (err) {
        res.status(500).send('Error registering user: ' + err.message);
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
