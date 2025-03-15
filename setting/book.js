const { body, header, validationResult } = require('express-validator');

module.exports = {
    BindUrl: function () {

        app.get('/add-book', async (req, res) => {
            res.render('add-book', { pageTitle: 'add-book', user: null });
        })
        app.get('/myBook', async (req, res) => {
            res.render('myBook', { pageTitle: 'myBook', user: null })
        })
        app.get('/book/:id', async (req, res) => {
            res.render('detail', { pageTitle: 'Book details', user: null })
        })
        app.get('/edit-myBook/:id', async (req, res) => {
            res.render('edit-myBook', { pageTitle: 'edit-myBook', user: null })
        })
    }
}