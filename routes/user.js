const { body, header, param, query, validationResult } = require('express-validator');

module.exports = {
    BindUrl: function () {
        app.post('/api/signup',
            body('email').not().isEmpty().trim(), //email number validation
            body('name').not().isEmpty().trim(), //name validation
            body('password').isLength({ min: 5 }).withMessage('Password not allowed'), //password validation
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else if (!validator.validate(req.body.email)) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        //calling controller function
                        var data = await req.body;


                        userApiController.signup(data, function (respData) {
                            res.status(respData.ReturnCode).send(respData);
                        });
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.get('/api/verifyemail',
            query('token').not().isEmpty(), // emapty token validation
            (req, res) => {
                console.log(req.query);

                try {
                    //Find the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        //calling controller function
                        var data = req.query;


                        userApiController.VERIFY_REGISTER_ACCOUNT(data, function (respData) {
                            res.render("confirmation", { pageTitle: 'confirmation email', respData: respData });

                        });
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData)
                }
            });
        app.post('/api/login',
            body('email').not().isEmpty().trim(),
            body('password').isLength({ min: 5 }).withMessage('Password not allowed'), //password validation
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        //calling controller function
                        var data = await req.body;
                        console.log(data);

                        userApiController.LOGIN(data, function (respData) {
                            res.status(respData.ReturnCode).send(respData);
                        })
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.get("/api/logout",
            header('authorization').not().isEmpty().trim(),
            async function (req, res) {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {

                        //calling controller function

                        apiJwtController.DECODE(req, function (respData) {
                            if (respData.ReturnCode !== 200) {
                                res.status(respData.ReturnCode).send(respData);
                            } else {
                                var sendData = {};
                                sendData['user_data'] = respData.Data;
                                sendData['token'] = req.headers.authorization.split(' ')[1];

                                userApiController.LOGOUT(sendData, function (respData) {
                                    if (typeof respData.StatusCode != "undefined") {
                                        res.status(respData.ReturnCode).send(respData);
                                    } else {
                                        res.status(respData.ReturnCode).send(respData);
                                    }
                                });
                            }
                        });
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);

                    res.status(respData.ReturnCode).send(respData);
                }
            })
        app.post('/api/change-password',
            body('old_password').isLength({ min: 5 }).withMessage('Old Password not allowed'), // old_password empty validation
            body('new_password').isLength({ min: 5 }).withMessage('New Password not allowed'), // new_password empty validation
            body('confirm_password').isLength({ min: 5 }).withMessage('Confirm Password not allowed'), // confirm_password empty validation
            header('authorization').not().isEmpty().trim(), // header authorization token validation
            (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        apiJwtController.DECODE(req, function (respData) {
                            if (respData.ReturnCode !== 200) {
                                res.status(respData.ReturnCode).send(respData);
                            } else {
                                //calling controller function
                                var data = req.body;
                                data.userData = respData.Data;
                                userApiController.CHANGE_PASSWORD(data, function (respData) {
                                    res.status(respData.ReturnCode).send(respData);
                                });
                            }
                        });
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.post('/api/forgot-password',
            body('email').not().isEmpty().trim(), // emapty email validation
            (req, res) => {
                try {
                    //Find the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        // calling controller function
                        var data = req.body;
                        userApiController.FORGOT_PASSWORD(data, function (respData) {
                            res.status(respData.ReturnCode).send(respData);
                        });
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData)
                }
            });
        app.post('/api/reset-forgot-password',
            body('password').not().isEmpty().trim(), // emapty email validation
            body('confirmpassword').not().isEmpty().trim(), // emapty email validation
            body('token').not().isEmpty().trim(), // emapty email validation
            (req, res) => {
                try {
                    //Find the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        //calling controller function
                        var data = req.body;

                        if (data.password === data.confirmpassword) {
                            userApiController.RESET_FORGOT_PASSWORD(data, function (respData) {
                                res.status(respData.ReturnCode).send(respData)
                            })
                        } else {
                            const err = "password and confirmpassword is not match"
                            var respData = commonController.errorValidationResponse(err);
                            res.status(respData.ReturnCode).send(respData)

                        }
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData)
                }
            });
        app.post('/api/delete_usertoken',
            header('authorization').not().isEmpty().trim(), //password validation
            async (req, res) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        //calling controller function
                        apiJwtController.DECODE(req, function (respData) {
                            if (respData.ReturnCode !== 200) {
                                res.status(respData.ReturnCode).send(respData);
                            } else {
                                var data = {}
                                data.userData = respData.Data;

                                console.log("userdata in api", data);
                                userApiController.DELETE_USER(data, function (respData) {
                                    if (typeof respData.StatusCode != "undefined") {
                                        res.status(respData.ReturnCode).send(respData);
                                    } else {
                                        res.status(respData.ReturnCode).send(respData);
                                    }
                                });
                            }
                        }
                        );
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.get("/api/profile",
            header('authorization').not().isEmpty().trim(),
            async function (req, res) {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        //calling controller function
                        apiJwtController.DECODE(req, function (respData) {
                            if (respData.ReturnCode !== 200) {
                                res.status(respData.ReturnCode).send(respData);
                            } else {
                                var data = respData.Data;
                                userApiController.GET_PROFILE(data, function (respData) {
                                    if (typeof respData.StatusCode != "undefined") {
                                        res.status(respData.ReturnCode).send(respData);
                                    } else {
                                        res.status(respData.ReturnCode).send(respData);
                                    }
                                });
                            }
                        });
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            })

        app.put('/api/profile',
            header('authorization').not().isEmpty().trim(),
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {

                        apiJwtController.DECODE(req, function (respData) {
                            if (respData.ReturnCode !== 200) {
                                res.status(respData.ReturnCode).send(respData);
                            } else {
                                var sendData = {
                                    updateBody: req.body,
                                    userData: respData.Data
                                };
                                if (req.file) {
                                    user.profile_img = {
                                        data: req.file.buffer,
                                        contentType: req.file.mimetype
                                    };
                                }

                                userApiController.UPDATE_PROFILE(sendData, function (respData) {
                                    if (typeof respData.StatusCode != "undefined") {
                                        res.status(respData.ReturnCode).send(respData);
                                    } else {
                                        res.status(respData.ReturnCode).send(respData);
                                    }
                                })
                            }
                        })
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.post('/api/resend_email',
            body('email').not().isEmpty().trim(),
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else if (!validator.validate(req.body.email)) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        //calling controller function
                        var data = req.body;
                        userApiController.RESEND_EMAIL(data, function (respData) {
                            res.status(respData.ReturnCode).send(respData);
                        });
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }

            });
    }
}


//router.post('/signup', signup);
//router.post('/login', login);

//module.exports = router;
