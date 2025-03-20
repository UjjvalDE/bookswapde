usersApiUrlHandler = module.exports = require('../routes/user');
usersApiUrlHandler.BindUrl();

homeApiUrlHandler = module.exports = require('./home.js');
homeApiUrlHandler.BindUrl();