const bookModal = require('../models/Book');
const userModel = require('../models/user')

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Set in your environment variables
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Set in your environment variables
    region: process.env.AWS_REGION // e.g., 'us-east-1'
});

module.exports = {
    ADDBOOK: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

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
            };
            var respData = await bookModal.create(bookdetail);
            if (respData) {
                sendData['ReturnCode'] = 200;
                sendData['Data'] = respData;
                callback(sendData);
            }
        } else {
            console.log('already');
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['Data'] = bookData;
            sendData['ReturnMsg'] = "This book already Added";
            callback(sendData);
        }
    },

    MYBOOK: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        const condition = {
            addedBy: data.Data._id
        };

        var bookData = await bookModal.find(condition);
        if (bookData.length > 0) {
            sendData['ReturnCode'] = 200;
            sendData['Data'] = bookData;
            callback(sendData);
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['ReturnMsg'] = "No book you added yet";
            callback(sendData);
        }
    },

    DETAIL: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        const user_id = data.userData.Data._id;
        const book_id = data.bookId.replace(/[^a-fA-F0-9]/g, "");

        const condition = {
            _id: book_id
        };
        const bookData = await bookModal.find(condition);
        if (bookData.length > 0) {
            const sellerData = await userModel.findOne({ _id: bookData[0].addedBy });

            if (sellerData) {
                bookData[0].userName = sellerData.name;
                var admin = ObjectId(user_id).equals(bookData[0].addedBy) ? true : false;
                if (admin == true) {
                    returnData = {
                        bookName: bookData[0].bookName,
                        coverImage: bookData[0].coverImage,
                        description: bookData[0].description,
                        price: bookData[0].price,
                        addedBy: sellerData.name,
                        admin: admin,
                        bookType: bookData[0].bookType,
                        sellerData: sellerData
                    };
                    sendData['ReturnCode'] = 200;
                    sendData['Data'] = returnData;
                    callback(sendData);
                } else {
                    const userData = await userModel.findOne({ _id: user_id });
                    returnData = {
                        bookName: bookData[0].bookName,
                        coverImage: bookData[0].coverImage,
                        description: bookData[0].description,
                        price: bookData[0].price,
                        addedBy: sellerData.name,
                        admin: admin,
                        bookType: bookData[0].bookType,
                        sellerData: sellerData,
                        userData: userData
                    };
                    sendData['ReturnCode'] = 200;
                    sendData['Data'] = returnData;
                    callback(sendData);
                }
            }
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['ReturnMsg'] = "No book found";
            callback(sendData);
        }
    },

    UPDATE: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        const user_id = data.userData.Data._id;
        const book_id = data.bookId.replace(/[^a-fA-F0-9]/g, "");
        const bookData = data.bookData;
        const { myBookName, coverImage, description, myBookType, price } = bookData;

        const condition = {
            _id: book_id
        };
        const updateData = {
            bookName: myBookName,
            coverImage: coverImage,
            description: description,
            price: price,
            bookType: myBookType
        };
        const updateBook = await bookModal.update(condition, updateData);
        if (updateBook.length > 0) {
            sendData['ReturnCode'] = 200;
            sendData['Data'] = updateBook;
            sendData['ReturnMsg'] = "Update bookData done";
            callback(sendData);
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['ReturnMsg'] = "No book found";
            callback(sendData);
        }
    },

    DELETE: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        const user_id = data.userData.Data._id;
        const book_id = data.bookId.replace(/[^a-fA-F0-9]/g, "");

        const condition = {
            _id: book_id
        };

        const deleteBook = await bookModal.remove(condition);
        if (deleteBook.length > 0) {
            sendData['ReturnCode'] = 200;
            sendData['ReturnMsg'] = "Delete Book from this platform";
            callback(sendData);
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['ReturnMsg'] = "No book found";
            callback(sendData);
        }
    },

    ALLBOOK: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        try {
            const { search, type, price } = data.search || {};

            let query = {
                available: true,
                addedBy: { $ne: data.userData && data.userData.Data ? data.userData.Data._id : null }
            };

            if (search) {
                query.$or = [
                    { bookName: { $regex: search, $options: 'i' } },
                    { bookType: { $regex: search, $options: 'i' } }
                ];
            }

            if (type) query.bookType = type;
            if (price) {
                try {
                    if (price.endsWith('+')) {
                        const min = parseFloat(price.slice(0, -1));
                        if (!isNaN(min)) {
                            query.price = { $gte: min };
                        }
                    } else if (price === '0-0') {
                        query.price = { $eq: 0 };
                    } else {
                        const [min, max] = price.split('-').map(p => parseFloat(p));
                        if (!isNaN(min)) {
                            query.price = { $gte: min };
                            if (!isNaN(max)) {
                                query.price.$lte = max;
                            }
                        }
                    }
                } catch (error) {
                    console.error("Price parsing error:", error);
                }
            }

            let bookData = await bookModal.find(query)
                .populate('addedBy', 'name email')
                .lean()
                .exec();

            if (data.userData && data.userData.interestedBooks && data.userData.interestedBooks.length > 0) {
                const userInterests = data.userData.interestedBooks
                    .filter(book => typeof book === 'string')
                    .map(book => book.toLowerCase());

                const [matches, others] = bookData.reduce((acc, book) => {
                    const bookName = (book.bookName || '').toLowerCase();
                    const index = userInterests.includes(bookName) ? 0 : 1;
                    acc[index].push(book);
                    return acc;
                }, [[], []]);

                if (!search && !type && !price) {
                    others.sort(() => Math.random() - 0.5);
                }

                bookData = [...matches, ...others];
            } else if (!search && !type && !price) {
                bookData.sort(() => Math.random() - 0.5);
            }

            if (bookData.length > 0) {
                const formattedBooks = bookData.map(book => ({
                    ...book,
                    sellerName: book.addedBy && book.addedBy.name ? book.addedBy.name : 'Unknown Seller',
                    sellerEmail: book.addedBy ? book.addedBy.email : null,
                    addedBy: book.addedBy ? book.addedBy._id : null
                }));

                sendData.Data = formattedBooks;
                sendData.ReturnMsg = "Books fetched successfully";
            } else {
                try {
                    const suggestions = await bookModal.aggregate([
                        {
                            $match: {
                                bookName: { $exists: true },
                                available: true
                            }
                        },
                        { $sample: { size: 10 } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: 'seller'
                            }
                        },
                        { $unwind: { path: '$seller', preserveNullAndEmpty: true } },
                        {
                            $project: {
                                bookName: 1,
                                bookType: 1,
                                price: 1,
                                coverImage: 1,
                                description: 1,
                                available: 1,
                                sellerName: '$seller.name',
                                sellerEmail: '$seller.email'
                            }
                        }
                    ]);

                    sendData.ReturnCode = 200;
                    sendData.Data = suggestions;
                    sendData.ReturnMsg = suggestions.length > 0
                        ? "No matches found. Here are some suggestions:"
                        : "No books available at the moment";
                } catch (suggestError) {
                    console.error("Suggestions error:", suggestError);
                    sendData.ReturnCode = 200;
                    sendData.Data = [];
                    sendData.ReturnMsg = "No books available at the moment";
                }
            }

            return callback(sendData);
        } catch (error) {
            console.error("ALLBOOK Error:", error);
            sendData.ReturnCode = 500;
            sendData.err = 1;
            sendData.ReturnMsg = "An error occurred while fetching books";
            return callback(sendData);
        }
    },

    TOGGLEAVAILABILITY: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        try {
            const user_id = data.userData.Data._id;
            const book_id = data.bookId.replace(/[^a-fA-F0-9]/g, "");
            const newAvailability = data.available;

            const book = await bookModal.findOne({ _id: book_id });

            if (!book) {
                sendData.ReturnCode = 404;
                sendData.err = 1;
                sendData.ReturnMsg = "Book not found";
                return callback(sendData);
            }

            if (!book.addedBy.equals(user_id)) {
                sendData.ReturnCode = 403;
                sendData.err = 1;
                sendData.ReturnMsg = "You are not authorized to update this book";
                return callback(sendData);
            }

            book.available = newAvailability;
            await book.save();

            sendData.Data = book;
            sendData.ReturnMsg = `Book marked as ${newAvailability ? 'available' : 'unavailable'}`;
            callback(sendData);
        } catch (err) {
            console.error("Toggle availability error:", err);
            sendData.ReturnCode = 500;
            sendData.err = 1;
            sendData.ReturnMsg = "Error updating book availability";
            callback(sendData);
        }
    },
    GETUPLOADURL: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        try {
            const { fileName, fileType } = data;

            if (!fileName || !fileType) {
                sendData.ReturnCode = 400;
                sendData.err = 1;
                sendData.ReturnMsg = "File name and type are required";
                return callback(sendData);
            }

            const uniqueFileName = `${Date.now()}-${fileName}`;
            const bucketName = process.env.AWS_S3_BUCKET_NAME;

            const params = {
                Bucket: bucketName,
                Key: `book-covers/${uniqueFileName}`,
                Expires: 60,
                ContentType: fileType, // Ensure this matches the file.type sent from the frontend
                ACL: 'public-read'
            };

            console.log('Generating presigned URL with params:', params); // Debug log

            const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
            const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/book-covers/${uniqueFileName}`;

            sendData.Data = {
                uploadUrl,
                fileUrl
            };
            sendData.ReturnMsg = "Upload URL generated successfully";
            callback(sendData);
        } catch (error) {
            console.error("GETUPLOADURL Error:", error);
            sendData.ReturnCode = 500;
            sendData.err = 1;
            sendData.ReturnMsg = "Error generating upload URL";
            callback(sendData);
        }
    }
};