

usersApiUrlHandler = module.exports = require('../routes/user');
usersApiUrlHandler.BindUrl();


bookApiUrlHandler = module.exports = require('../routes/book');
bookApiUrlHandler.BindUrl();

homeApiUrlHandler = module.exports = require('./home.js');
homeApiUrlHandler.BindUrl();