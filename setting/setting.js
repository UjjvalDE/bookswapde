userslHandler = module.exports = require('./user');
userslHandler.BindUrl();

bookHandler = module.exports = require('./book');
bookHandler.BindUrl();

homeHandler = module.exports = require('./home');
homeHandler.BindUrl();