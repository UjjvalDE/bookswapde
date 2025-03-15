const { body, header, validationResult } = require('express-validator');

module.exports = {
    BindUrl: function () {

        app.get('/', async (req, res) => {
            res.render('home', { pageTitle: 'Home', user: null });
        })
        app.get('/landing', async (req, res) => {
            res.render('index', { pageTitle: 'Index', user: null });
        })


    }
}