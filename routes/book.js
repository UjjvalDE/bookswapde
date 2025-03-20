const { body, header, param, query, validationResult } = require('express-validator');

module.exports = {
    BindUrl: function () {
        app.post('/api/add-book',
            body('bookName').not().isEmpty().trim(), //email number validation
            body('price').not().isEmpty().trim(),
            header('authorization').not().isEmpty().trim(),
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);

                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {

                        apiJwtController.DECODE(req, async function (userData) {

                            if (userData.ReturnCode != 200) {
                                res.status(userData.ReturnCode).send(userData);
                            } else {
                                var data = await req.body;
                                data.userData = userData
                                bookApiController.ADDBOOK(data, function (respData) {
                                    res.status(respData.ReturnCode).send(respData);
                                });
                            }

                        })

                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.get('/api/myBook',
            header('authorization').not().isEmpty().trim(),
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);

                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {

                        apiJwtController.DECODE(req, async function (userData) {

                            if (userData.ReturnCode != 200) {
                                res.status(userData.ReturnCode).send(userData);
                            } else {


                                bookApiController.MYBOOK(userData, function (respData) {
                                    console.log("respData", respData);
                                    res.status(respData.ReturnCode).send(respData);
                                });
                            }

                        })

                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.get('/api/book/:id',
            header("authorization").not().isEmpty().trim(),
            param("id").not().isEmpty().trim().isLength({ min: 24, })
                .withMessage("please vaild id"),
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);

                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {

                        apiJwtController.DECODE(req, async function (userData) {
                            if (userData.ReturnCode != 200) {
                                res.status(userData.ReturnCode).send(userData);
                            } else {

                                var sendData = { bookId: req.params.id, userData: userData }
                                bookApiController.DETAIL(sendData, function (respData) {
                                    console.log(respData);
                                    res.status(respData.ReturnCode).send(respData);
                                });
                            }

                        })

                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.put('/api/book/:id',
            header("authorization").not().isEmpty().trim(),
            param("id").not().isEmpty().trim().isLength({ min: 24, })
                .withMessage("please vaild id"),
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);

                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {

                        apiJwtController.DECODE(req, async function (userData) {
                            if (userData.ReturnCode != 200) {
                                res.status(userData.ReturnCode).send(userData);
                            } else {

                                var sendData = { bookId: req.params.id, userData: userData, bookData: req.body }
                                bookApiController.UPDATE(sendData, function (respData) {
                                    console.log(respData);
                                    res.status(respData.ReturnCode).send(respData);
                                });
                            }

                        })

                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.delete('/api/book/:id',
            header("authorization").not().isEmpty().trim(),
            param("id").not().isEmpty().trim().isLength({ min: 24, })
                .withMessage("please vaild id"),
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);

                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {

                        apiJwtController.DECODE(req, async function (userData) {
                            if (userData.ReturnCode != 200) {
                                res.status(userData.ReturnCode).send(userData);
                            } else {

                                var sendData = { bookId: req.params.id, userData: userData }
                                bookApiController.DELETE(sendData, function (respData) {
                                    console.log(respData);
                                    res.status(respData.ReturnCode).send(respData);
                                });
                            }

                        })

                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.get('/api/allBook',
            async (req, res) => {

                if (req.headers.authorization) {
                    apiJwtController.DECODE(req, async function (userData) {
                        if (userData.ReturnCode != 200) {
                            res.status(userData.ReturnCode).send(userData);
                        } else {

                            const searchData = {
                                search: req.query,
                                userData: userData
                            }

                            bookApiController.ALLBOOK(searchData, function (respData) {
                                console.log("respData", respData);
                                res.status(respData.ReturnCode).send(respData);
                            });
                        }

                    })
                } else {
                    const searchData = {
                        search: req.query
                    }

                    bookApiController.ALLBOOK(searchData, function (respData) {
                        console.log("respData", respData);
                        res.status(respData.ReturnCode).send(respData);
                    });
                }

            })
        app.put('/api/book/:id/availability',
            header("authorization").not().isEmpty().trim(),
            param("id").not().isEmpty().trim().isLength({ min: 24 })
                .withMessage("please provide valid id"),
            body("available").isBoolean().withMessage("available must be a boolean"),
            async (req, res) => {
                try {
                    const errors = validationResult(req);

                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        apiJwtController.DECODE(req, async function (userData) {
                            if (userData.ReturnCode != 200) {
                                res.status(userData.ReturnCode).send(userData);
                            } else {
                                var sendData = {
                                    bookId: req.params.id,
                                    userData: userData,
                                    available: req.body.available
                                }
                                bookApiController.TOGGLEAVAILABILITY(sendData, function (respData) {
                                    res.status(respData.ReturnCode).send(respData);
                                });
                            }
                        })
                    }
                } catch (err) {
                    var respData = commonController.errorValidationResponse(err);
                    res.status(respData.ReturnCode).send(respData);
                }
            });
        app.post('/api/upload',
            header('authorization').not().isEmpty().trim(),
            async (req, res) => {
                try {
                    // Finds the validation errors in this request and wraps them in an object with handy functions
                    const errors = validationResult(req);

                    if (!errors.isEmpty()) {
                        var respData = commonController.errorValidationResponse(errors);
                        res.status(respData.ReturnCode).send(respData);
                    } else {
                        apiJwtController.DECODE(req, async function (userData) {
                            if (userData.ReturnCode != 200) {
                                res.status(userData.ReturnCode).send(userData);
                            } else {
                                var sendData = {
                                    userData: userData,
                                    fileName: req.body.fileName,
                                    fileType: req.body.fileType
                                }
                                bookApiController.GETUPLOADURL(sendData, function (respData) {
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
    },

}