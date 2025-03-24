const { body, header, param, query, validationResult } = require('express-validator');

module.exports = {
    BindUrl: function () {
        app.get('/privacy-policy', (req, res) => {
            res.render('privacy-policy', { pageTitle: 'Privacy Policy', user: null });
        });

        app.get('/terms-of-service', (req, res) => {
            res.render('terms-of-service', { pageTitle: 'Terms of Service', user: null });
        });

        app.get('/cookie-policy', (req, res) => {
            res.render('cookie-policy', { pageTitle: 'Cookie Policy', user: null });
        });

        app.get('/about', (req, res) => {
            res.render('about', { pageTitle: 'About Us', user: null });
        });

        app.get('/contact', (req, res) => {
            res.render('contact', { pageTitle: 'Contact Us', user: null });
        });

        // Contact form submission (for demo purposes, just return a success message)
        app.post('/api/contact', (req, res) => {
            // In a real application, you would process the form data and send an email
            // For demo purposes, we'll just return a success message
            res.json({ success: true, message: 'Message sent successfully!' });
        });


    },

}