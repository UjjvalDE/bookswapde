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

        app.post('/upload-file', upload.single('file'), async (req, res) => {
            try {
                // Check for authorization header
                const errors = validationResult(req);
                if (!req.headers.authorization) {
                    return res.status(401).json({
                        ReturnCode: 401,
                        err: 1,
                        ReturnMsg: 'Authorization header is required'
                    });
                }

                // Decode the token to verify the user
                apiJwtController.DECODE(req, async function (userData) {
                    if (userData.ReturnCode !== 200) {
                        return res.status(userData.ReturnCode).json(userData);
                    }

                    // Proceed with file upload if user is authenticated
                    if (!req.file) {
                        return res.status(400).json({
                            ReturnCode: 400,
                            err: 1,
                            ReturnMsg: 'No file uploaded.'
                        });
                    }

                    // Extract file data from the request
                    const file = req.file;
                    const fileName = `book-covers/${Date.now()}-${file.originalname}`;
                    const fileContent = file.buffer;

                    // S3 upload parameters
                    const params = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: fileName,
                        Body: fileContent,
                        ContentType: file.mimetype,
                        ACL: 'public-read'
                    };

                    // Upload the file to S3
                    const uploadResult = await s3.upload(params).promise();

                    // Ensure the upload result contains a Location
                    if (!uploadResult.Location) {
                        return res.status(500).json({
                            ReturnCode: 500,
                            err: 1,
                            ReturnMsg: 'Failed to retrieve file URL from S3'
                        });
                    }

                    // Return the uploaded file URL
                    res.status(200).json({
                        ReturnCode: 200,
                        err: 0,
                        Data: {
                            fileUrl: uploadResult.Location
                        },
                        ReturnMsg: 'File uploaded successfully'
                    });
                });
            } catch (error) {
                console.error('Error uploading file:', error);
                res.status(500).json({
                    ReturnCode: 500,
                    err: 1,
                    ReturnMsg: 'Failed to upload file'
                });
            }
        });
    },

}