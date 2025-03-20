const bookModal = require('../models/Book');
const userModel = require('../models/user')
const loginTokenModal = require('../models/login_token/login_token');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const book = require('../setting/book');
const url = process.env.BASE_URL
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

module.exports = {
    ADDBOOK: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            bookName: data.bookName,
            addedBy: data.userData.Data._id
        };

        var bookData = await bookModal.find(condition);
        if (bookData.length <= 0) {
            const bookdetail = {
                bookName: data.bookName,
                coverImage: data.coverImage,
                description: data.description,
                price: data.price,
                bookType: data.bookType,
                addedBy: data.userData.Data._id
            }
            var respData = await bookModal.create(bookdetail);
            if (respData) {
                sendData['ReturnCode'] = 200;
                sendData['Data'] = respData;
                callback(sendData)
            }

        } else {
            console.log('already');

            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['Data'] = bookData;
            sendData['ReturnMsg'] = "This book already Added";
            callback(sendData)
        }
    },
    MYBOOK: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            addedBy: data.Data._id
        };

        var bookData = await bookModal.find(condition);
        if (bookData.length > 0) {
            sendData['ReturnCode'] = 200;
            sendData['Data'] = bookData;
            callback(sendData)
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['Data'] = bookData;
            sendData['ReturnMsg'] = "No Book Found";
            callback(sendData)
        }
    },
    DETAIL: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            _id: data.bookId
        };

        var bookData = await bookModal.findOne(condition);
        if (bookData) {
            sendData['ReturnCode'] = 200;
            sendData['Data'] = bookData;
            callback(sendData)
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['Data'] = bookData;
            sendData['ReturnMsg'] = "No Book Found";
            callback(sendData)
        }
    },
    UPDATE: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            _id: data.bookId,
            addedBy: data.userData.Data._id
        };

        var bookData = await bookModal.findOne(condition);
        if (bookData) {
            var updateData = await bookModal.findByIdAndUpdate(data.bookId, data.bookData, { new: true });
            if (updateData) {
                sendData['ReturnCode'] = 200;
                sendData['Data'] = updateData;
                callback(sendData)
            } else {
                sendData['ReturnCode'] = 201;
                sendData['err'] = 1;
                sendData['Data'] = updateData;
                sendData['ReturnMsg'] = "No Book Found";
                callback(sendData)
            }
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['Data'] = bookData;
            sendData['ReturnMsg'] = "No Book Found";
            callback(sendData)
        }
    },
    DELETE: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            _id: data.bookId,
            addedBy: data.userData.Data._id
        };

        var bookData = await bookModal.findOne(condition);
        if (bookData) {
            var deleteData = await bookModal.findByIdAndDelete(data.bookId);
            if (deleteData) {
                sendData['ReturnCode'] = 200;
                sendData['Data'] = deleteData;
                callback(sendData)
            } else {
                sendData['ReturnCode'] = 201;
                sendData['err'] = 1;
                sendData['Data'] = deleteData;
                sendData['ReturnMsg'] = "No Book Found";
                callback(sendData)
            }
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['Data'] = bookData;
            sendData['ReturnMsg'] = "No Book Found";
            callback(sendData)
        }
    },
    ALLBOOK: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        var condition = {};

        if (data.search.search) {
            condition = {
                bookName: { $regex: data.search.search, $options: 'i' }
            }
        }

        if (data.userData) {
            condition.addedBy = { $ne: data.userData.Data._id }
        }

        var bookData = await bookModal.find(condition);
        if (bookData.length > 0) {
            sendData['ReturnCode'] = 200;
            sendData['Data'] = bookData;
            callback(sendData)
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['Data'] = bookData;
            sendData['ReturnMsg'] = "No Book Found";
            callback(sendData)
        }
    },
    TOGGLEAVAILABILITY: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            _id: data.bookId,
            addedBy: data.userData.Data._id
        };

        var bookData = await bookModal.findOne(condition);
        if (bookData) {
            var updateData = await bookModal.findByIdAndUpdate(
                data.bookId,
                { available: data.available },
                { new: true }
            );
            if (updateData) {
                sendData['ReturnCode'] = 200;
                sendData['Data'] = updateData;
                callback(sendData)
            } else {
                sendData['ReturnCode'] = 201;
                sendData['err'] = 1;
                sendData['Data'] = updateData;
                sendData['ReturnMsg'] = "Failed to update book availability";
                callback(sendData)
            }
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['Data'] = bookData;
            sendData['ReturnMsg'] = "No Book Found";
            callback(sendData)
        }
    },
    GETUPLOADURL: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            Data: {},
            ReturnMsg: ""
        };

        try {
            const { fileName, fileType } = data;

            if (!fileName || !fileType) {
                sendData.ReturnCode = 400;
                sendData.ReturnMsg = 'File name and type are required';
                callback(sendData);
                return;
            }

            // Generate unique file name to prevent overwrites
            const fileExtension = fileName.split('.').pop();
            const uniqueFileName = `${uuidv4()}.${fileExtension}`;

            // Set up S3 upload parameters
            const s3Params = {
                Bucket: BUCKET_NAME,
                Key: `book-covers/${uniqueFileName}`,
                ContentType: fileType,
                Expires: 60 * 5 // URL expires in 5 minutes
            };

            // Generate upload URL
            const uploadUrl = await s3.getSignedUrlPromise('putObject', s3Params);

            // Generate the final file URL that will be stored in the database
            const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/book-covers/${uniqueFileName}`;

            sendData.Data = { uploadUrl, fileUrl };
            sendData.ReturnMsg = 'Upload URL generated successfully';
            callback(sendData);

        } catch (error) {
            console.error('Error generating upload URL:', error);
            sendData.ReturnCode = 500;
            sendData.ReturnMsg = 'Failed to generate upload URL';
            callback(sendData);
        }
    }
}; 