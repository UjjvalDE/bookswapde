// Step 1: Initialize Express Server and Setup Authentication
fs = require("fs");
express = require('express');
bodyParser = require('body-parser');
path = require('path');

app = module.exports = express();
http = module.exports = require('http').Server(app);
request = module.exports = require('request');
mongoose = module.exports = require('mongoose');
multer = module.exports = require('multer');
_ = module.exports = require('underscore');
cors = module.exports = require("cors");
jwt = module.exports = require('jsonwebtoken');
md5 = module.exports = require('md5');
cookieParser = module.exports = require('cookie-parser');
pagination = module.exports = require('pagination');
validator = module.exports = require("email-validator");
nodemailer = module.exports = require('nodemailer');
ejs = module.exports = require('ejs');
moment = module.exports = require('moment')

schedule = module.exports = require('node-schedule');

require('dotenv').config();

// Initialize Express App
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
// Middleware
app.use(express.json());
app.use(cors());

// Configure Mongoose
mongoose.set('strictQuery', false);

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

// Make ObjectId available globally
ObjectId = module.exports = mongoose.mongo.ObjectId;

//Setting
require('./setting/setting');

// Routes
require('./routes/common');
require('./routes/commonController');

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));