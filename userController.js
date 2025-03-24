const userModal = require('../models/user');
const loginTokenModal = require('../models/login_token/login_token');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const url = process.env.BASE_URL
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Helper function to safely convert string to ObjectId
const toObjectId = (id) => {
    try {
        return mongoose.Types.ObjectId(id);
    } catch (error) {
        return null;
    }
};

module.exports = {
    signup: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        try {
            // Validate required fields
            const requiredFields = ['name', 'email', 'password', 'country_code', 'number', 'address', 'postcode', 'interestedBooks'];
            const missingFields = requiredFields.filter(field => !data[field]);

            if (missingFields.length > 0) {
                sendData.ReturnCode = 401;
                sendData.err = 1;
                sendData.ReturnMsg = `Missing required fields: ${missingFields.join(', ')}`;
                return callback(sendData);
            }

            // Check if email already exists
            const existingUser = await userModal.findOne({ email: data.email });
            if (existingUser && !existingUser.temp) {
                sendData.ReturnCode = 201;
                sendData.err = 1;
                sendData.ReturnMsg = "This email is already registered. Please use a different email or try logging in.";
                return callback(sendData);
            }

            // Create new user
            const userData = {
                name: data.name,
                email: data.email,
                password: data.password,
                country_code: data.country_code,
                number: data.number,
                address: data.address,
                postcode: data.postcode,
                created_at: new Date(),
                temp: false,
                profile_img: data.profileImage || "cat"
            };

            let user;
            if (existingUser && existingUser.temp) {
                // Update temporary user
                user = await userModal.findOneAndUpdate(
                    { email: data.email },
                    userData,
                    { new: true }
                );
            } else {
                // Create new user
                user = await userModal.create(userData);
            }

            // Generate JWT token
            const payload = {
                _id: user._id,
                active: user.active,
                block: user.block
            };
            const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });

            // Generate verification link
            const verificationToken = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: "24h" });
            const verificationLink = `${url}/api/verifyemail/?token=${verificationToken}`;

            // Send verification email
            try {
                await ejs.renderFile(
                    path.join('/Volumes/D/iu/project/Bookstore-master/templates/confirm_account.ejs'),
                    { link: verificationLink },
                    async (err, emailContent) => {
                        if (!err) {
                            await commonController.__sendEmail(
                                user.email,
                                "Confirm your Bookswap account",
                                emailContent
                            );
                        }
                    }
                );
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
            }

            // Set response data
            const expireDate = new Date(new Date().setHours(new Date().getHours() + 24));
            const z = {
                Y: expireDate.getFullYear(),
                M: expireDate.getMonth() + 1,
                d: expireDate.getDate(),
                h: expireDate.getHours(),
                m: expireDate.getMinutes(),
                s: expireDate.getSeconds()
            };

            sendData.Data = {
                Userdata: {
                    name: user.name,
                    email: user.email,
                    email_verify: user.email_verify
                },
                ReturnMsg: "A verification email has been sent to " + user.email,
                Token: token,
                TokenType: "Bearer",
                TokenExpire: z.Y + "-" + ((z.M > 9) ? z.M : '0' + z.M) + "-" + ((z.d > 9) ? z.d : '0' + z.d) + " " + ((z.h > 9) ? z.h : '0' + z.h) + ":" + ((z.m > 9) ? z.m : '0' + z.m) + ":" + ((z.s > 9) ? z.s : '0' + z.s)
            };

            return callback(sendData);

        } catch (error) {
            console.error('Signup error:', error);
            sendData.ReturnCode = 500;
            sendData.err = 1;
            sendData.ReturnMsg = "An error occurred during signup. Please try again.";
            return callback(sendData);
        }
    },
    VERIFY_REGISTER_ACCOUNT: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: "",
        };

        console.log("data>>", data)
        var token = data.token
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (!decoded) {
                sendData['ReturnCode'] = 400;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Your token is not valid";
                callback(sendData);
            }
            if (typeof decoded._id != "undefined") {
                var verifyData = await userModal.find({
                    _id: decoded._id
                })
                console.log("verifyData>>", verifyData)
                if (verifyData.length > 0) {
                    verifyData = verifyData[0]

                    // const userVerifyData = await userModal.updateOne({ _id: decoded._id }, { email_verify: true })
                    let usersData = await userModal.find({ _id: decoded._id })

                    usersData = usersData[0]
                    if (usersData.email_verify == true) {
                        sendData['ReturnCode'] = 201;
                        sendData['err'] = 1;
                        sendData['Data'] = [];
                        sendData['ReturnMsg'] = 'already verify';
                        callback(sendData);
                    }
                    else {
                        var payload = {
                            _id: usersData._id,
                        };

                        usersData.token = jwt.sign(payload, process.env.SECRET_KEY);
                        var userUpdate = {
                            email_verify: true,
                        }
                        const userVerifyData = await userModal.updateOne({ _id: decoded._id }, userUpdate);


                        const expireDate = new Date(new Date().setHours(new Date().getHours() + 24));
                        const z = {
                            Y: expireDate.getFullYear(),
                            M: expireDate.getMonth() + 1,
                            d: expireDate.getDate(),
                            h: expireDate.getHours(),
                            m: expireDate.getMinutes(),
                            s: expireDate.getSeconds()
                        };
                        sendData['Data'] = {
                            Userdata: {
                                _id: userVerifyData._id,
                                name: userVerifyData.name,
                                email: userVerifyData.email,
                                organization,
                                email_verify: userVerifyData.email_verify,
                                profile_img: userVerifyData.profile_img,

                            },

                            Token: jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" }),

                            TokenType: "Bearer",
                            TokenExpire: z.Y + "-" + ((z.M > 9) ? z.M : '0' + z.M) + "-" + ((z.d > 9) ? z.d : '0' + z.d) + " " + ((z.h > 9) ? z.h : '0' + z.h) + ":" + ((z.m > 9) ? z.m : '0' + z.m) + ":" + ((z.s > 9) ? z.s : '0' + z.s)
                        };
                        sendData['ReturnMsg'] = "email verify successfull"
                        console.log("Userdata>>", sendData['Data'].Userdata)
                        const tokenCreate = {
                            user_id: usersData._id,
                            token: usersData.token,
                        }
                        const token = await loginTokenModal.create(tokenCreate);
                        console.log(token);

                        sendData['Data'].token = token;
                        callback(sendData);


                        // sendData['ReturnCode'] = 200;
                        // sendData['err'] = 0;
                        // sendData["Data"] = {
                        // 	UserData,
                        // }

                        // sendData['ReturnMsg'] = "Your account has been verified"
                        // callback(sendData);
                    }
                } else {
                    sendData['ReturnCode'] = 400;
                    sendData['err'] = 1;
                    sendData['Data'] = [];
                    sendData['ReturnMsg'] = "Something went to wrong";
                    callback(sendData);
                }
            } else {
                sendData['ReturnCode'] = 400;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Something went to wrong";
                callback(sendData);
            }
        } catch (err) {
            sendData['ReturnCode'] = 400;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = err;
            callback(sendData);
        }
    },
    LOGIN: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            email: data.email,
            password: md5(data.password),
            deleted: false,
        };

        var usersData = await userModal.find(condition);
        if (usersData.length > 0) {
            console.log("usersData>>", usersData)
            usersData = usersData[0];
            if (usersData.email_verify == false) {
                sendData['ReturnCode'] = 301;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "You cannot login until you confirm your email address. We just emailed you a confirmation.";
                callback(sendData);
            } else {

                var payload = {
                    _id: usersData._id,
                    active: usersData.active,
                    block: usersData.block
                };
                const expireDate = new Date(new Date().setHours(new Date().getHours() + 24));
                const z = {
                    Y: expireDate.getFullYear(),
                    M: expireDate.getMonth() + 1,
                    d: expireDate.getDate(),
                    h: expireDate.getHours(),
                    m: expireDate.getMinutes(),
                    s: expireDate.getSeconds()
                };
                sendData['Data'] = {
                    Userdata: {
                        _id: usersData._id,
                        name: usersData.name,
                        email: usersData.email,
                        email_verify: usersData.email_verify,
                        profile_img: usersData.profile_img,

                    },

                    Token: jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" }),
                    TokenType: "Bearer",
                    TokenExpire: z.Y + "-" + ((z.M > 9) ? z.M : '0' + z.M) + "-" + ((z.d > 9) ? z.d : '0' + z.d) + " " + ((z.h > 9) ? z.h : '0' + z.h) + ":" + ((z.m > 9) ? z.m : '0' + z.m) + ":" + ((z.s > 9) ? z.s : '0' + z.s)
                };
                sendData['ReturnMsg'] = "Login successful"
                console.log("Userdata>>", sendData['Data'].Userdata)
                const tokenCreate = {
                    user_id: usersData._id,
                    token: sendData['Data'].Token,
                }
                const tokenData = await loginTokenModal.create(tokenCreate);

                callback(sendData);
            }
        } else {
            console.log('Invalid');

            sendData['ReturnCode'] = 400;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "Invalid email or password";
            callback(sendData)
        }
    },


    LOGOUT: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };
        //get user data into variable
        console.log("data>>", data)
        var userId = data.user_data._id;
        var condition = {
            _id: toObjectId(userId)
        }
        var usersData = await userModal.find(condition)
        console.log("usersData>>", usersData)
        if (usersData.length > 0) {
            usersData = usersData[0]

            let delete_login_token = {
                user_id: toObjectId(userId),
                token: data.token
            }
            let updateTokenData = await loginTokenModal.deleteOne(delete_login_token)
            console.log("updateTokenData>", updateTokenData)

            sendData['ReturnCode'] = 200;
            sendData['err'] = 0;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "You are logout"
            callback(sendData);
        } else {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "Something went to wrong";
            callback(sendData);
        }
    },
    CHANGE_PASSWORD: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };
        //get user data into variable
        var userData = data.userData;
        var old_password = data.old_password;
        var new_password = data.new_password;
        var confirm_password = data.confirm_password;

        //condition
        const condition = {
            _id: toObjectId(userData._id)
        };
        var usersData = await userModal.find(condition);

        //check user modal has data or not
        if (usersData.length > 0) {
            usersData = usersData[0];

            if (usersData.password !== md5(old_password)) {
                sendData['ReturnCode'] = 200;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Your old password is not match with your account."
                callback(sendData);
            } else if (new_password !== confirm_password) {
                sendData['ReturnCode'] = 200;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Password dosn't match with confirm password."
                callback(sendData);
            } else {
                const condition = {
                    _id: toObjectId(userData._id)
                };
                const updateData = {
                    password: md5(new_password)
                };
                //update data into user profile
                const respData = await userModal.updateOne(condition, updateData);
                console.log("respData", respData)
                const delete_token = await loginTokenModal.deleteMany({ user_id: toObjectId(userData._id) })
                console.log("delete_token", delete_token)
                sendData['ReturnCode'] = 200;
                sendData['err'] = 0;
                sendData['ReturnMsg'] = "New password is successfully set with your account."
                callback(sendData);
            }
        } else {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "User not login!"
            callback(sendData)
        }
    },
    FORGOT_PASSWORD: async function (data, callback) {
        console.log("data >>", data);
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: "",
        };

        //get user data into variable
        var email = data.email;
        //condition
        var condition = {
            email: email,
            email_verify: true
        };
        var usersData = await userModal.find(condition);

        if (usersData.length > 0) {
            usersData = usersData[0]
            const email = usersData.email
            var payload = {
                _id: usersData._id,

            };
            const token = jwt.sign(payload, process.env.SECRET_KEY);
            var link = `${url}/auth/reset-password/?token=${token}`;
            ejs.renderFile(path.join('/Volumes/D/iu/project/bookswapde/templates/reset_password.ejs'), { link: link }, (err, data) => {
                console.log("err>>", err)
                console.log("data>>>", data)
                if (!err) {
                    console.log(err);
                    var subject = "Forgot your Bookswap account password"
                    commonController.__sendEmail(email, subject, data);
                }
            })

            const delete_token = await loginTokenModal.deleteMany({ user_id: toObjectId(usersData._id) })
            console.log("delete_token", delete_token)

            sendData['ReturnCode'] = 200;
            sendData['err'] = 0;
            sendData['Data'] = token;
            sendData['ReturnMsg'] = `Send email to ${email}`
            callback(sendData)
        } else {
            sendData['ReturnCode'] = 400;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "Email not found or you not confirm your account."
            callback(sendData)
        }
    },
    RESET_FORGOT_PASSWORD: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };
        //get data into variabl

        const token = data.token
        const password = md5(data.password)
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (typeof decoded._id != "undefined") {

                var verifyData = await userModal.find({
                    _id: decoded._id
                })
                console.log("verifyData>>", verifyData)

                if (verifyData.length > 0) {
                    verifyData = verifyData[0]


                    var findData = await userModal.find({ email: verifyData.email })
                    console.log("findData>", findData)

                    if (findData.length > 0) {
                        findData = findData[0]
                        console.log("findData>>", findData)

                        const updateData = await userModal.updateOne({ email: findData.email }, { password: password })
                        const delete_token = await loginTokenModal.deleteMany({ user_id: toObjectId(findData._id) })
                        console.log("delete_token", delete_token)

                        sendData['ReturnCode'] = 200;
                        sendData['err'] = 0;
                        sendData['ReturnMsg'] = "Your password reset";
                        callback(sendData);
                    }
                } else {
                    sendData['ReturnCode'] = 200;
                    sendData['err'] = 1;
                    sendData['Data'] = [];
                    sendData['ReturnMsg'] = "Something went to wrong";
                    callback(sendData);
                }
            } else {
                sendData['ReturnCode'] = 200;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Something went to wrong";
                callback(sendData);
            }
        } catch (err) {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = err;
            callback(sendData);
        }
    },
    GET_PROFILE: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        try {
            if (!data || !data._id) {
                sendData.ReturnCode = 400;
                sendData.err = 1;
                sendData.ReturnMsg = "Invalid user data";
                return callback(sendData);
            }

            const userId = data._id;
            const user = await userModal.findOne({
                _id: toObjectId(userId),
                deleted: false
            }).select('-password');

            if (!user) {
                sendData.ReturnCode = 404;
                sendData.err = 1;
                sendData.ReturnMsg = "User not found";
                return callback(sendData);
            }

            // Format user data
            sendData.Data = {
                _id: user._id,
                name: user.name || '',
                email: user.email,
                country_code: user.country_code || '+49',
                number: user.number || '',
                address: user.address || '',
                postcode: user.postcode || '',
                interestedBooks: user.interestedBooks || [],
                profile_img: user.profile_img || 'cat',
                email_verify: user.email_verify
            };

            sendData.ReturnMsg = "Profile data retrieved successfully";
            return callback(sendData);

        } catch (error) {
            console.error("GET_PROFILE Error:", error);
            sendData.ReturnCode = 500;
            sendData.err = 1;
            sendData.ReturnMsg = "Error retrieving profile data";
            return callback(sendData);
        }
    },
    UPDATE_PROFILE: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: [],
            ReturnMsg: ""
        };

        try {
            let update_body = data.updateBody;
            const user_id = data.userData._id;
            const condition = {
                _id: toObjectId(user_id)
            };

            // Validate profile image URL if it's being updated
            if (update_body.profile_img) {
                // You can add validation here if needed
                update_body.profile_img = update_body.profile_img;
            }

            const userData = await userModal.findOne(condition);

            if (userData) {
                const updateUser = await userModal.findOneAndUpdate(condition, update_body, { new: true });

                if (updateUser) {
                    sendData.Data = updateUser;
                    sendData.ReturnMsg = "Profile updated successfully";
                    return callback(sendData);
                }
            }

            sendData.err = 1;
            sendData.ReturnMsg = "Failed to update profile";
            return callback(sendData);

        } catch (error) {
            console.error("UPDATE_PROFILE Error:", error);
            sendData.ReturnCode = 500;
            sendData.err = 1;
            sendData.ReturnMsg = "Error updating profile";
            return callback(sendData);
        }
    },
    DELETE_USER: async function (data, callback) {
        var sendData = {
            Returncode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };


        const condition = {
            _id: toObjectId(data.userData._id),

        }

        var userdata = await userModal.find(condition)

        if (userdata.length > 0) {
            const updatedata = {
                deleted: true,
            }
            const respdata = await userModal.updateOne(condition, updatedata)
            sendData['ReturnCode'] = 200,
                sendData['err'] = 0,
                sendData['Data'] = [];
            sendData['ReturnMsg'] = "User deleted";
            callback(sendData);
        }
        else {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "No record found";
            callback(sendData);
        }
    },
    RESEND_EMAIL: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: [],
            ReturnMsg: ""
        };
        console.log("data>", data)
        let email = data.email
        let condition = { email }
        let user = await userModal.findOne(condition)
        console.log("user>", user)
        let payload = { _id: user._id }
        const expireDate = new Date(new Date().setHours(new Date().getHours() + 24))
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });
        let link = `${url}/api/verifyemail/?token=${token}`
        console.log("link>>", link)
        // commonController.__sendEmail(usersData.email, link);
        ejs.renderFile(path.join('/Volumes/D/iu/project/Bookstore-master/templates/confirm_account.ejs'), { link: link }, (err, data) => {
            console.log("err>>", err)
            console.log("data>>>", data)
            if (!err) {
                console.log(err);
                var subject = "Confirm your Bookswap account"
                commonController.__sendEmail(email, subject, data);
            }
        })
            ;
        console.log("expireDate>", expireDate)
        const z = {
            Y: expireDate.getFullYear(),
            M: expireDate.getMonth() + 1,
            d: expireDate.getDate(),
            h: expireDate.getHours(),
            m: expireDate.getMinutes(),
            s: expireDate.getSeconds()
        };
        console.log("z>", z)

        sendData['Data'] = {
            Token: token,
            TokenType: "Bearer",
            TokenExpire: z.Y + "-" + ((z.M > 9) ? z.M : '0' + z.M) + "-" + ((z.d > 9) ? z.d : '0' + z.d) + " " + ((z.h > 9) ? z.h : '0' + z.h) + ":" + ((z.m > 9) ? z.m : '0' + z.m) + ":" + ((z.s > 9) ? z.s : '0' + z.s)
        };
        sendData['ReturnMsg'] = "Email resend to " + email,
            callback(sendData);
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            // Find user by email
            const user = await userModal.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    ReturnCode: 404,
                    ReturnMsg: 'No account with that email address exists.'
                });
            }

            // Generate reset token
            const resetToken = user.generatePasswordResetToken();
            await user.save();

            // Create reset URL
            const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

            // Send email with reset link
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <h1>You requested a password reset</h1>
                    <p>Please click on the following link to reset your password:</p>
                    <a href="${resetUrl}" target="_blank">Reset Password</a>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>This link will expire in 1 hour.</p>
                `
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({
                ReturnCode: 200,
                ReturnMsg: 'Password reset link sent to email address.'
            });

        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                ReturnCode: 500,
                ReturnMsg: 'Error sending password reset email. Please try again later.'
            });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { token } = req.params;
            const { password } = req.body;

            // Get hashed token
            const resetPasswordToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            // Find user with valid token
            const user = await userModal.findOne({
                resetPasswordToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    ReturnCode: 400,
                    ReturnMsg: 'Password reset token is invalid or has expired.'
                });
            }

            // Set new password
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.status(200).json({
                ReturnCode: 200,
                ReturnMsg: 'Password has been reset successfully.'
            });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                ReturnCode: 500,
                ReturnMsg: 'Error resetting password. Please try again later.'
            });
        }
    }
}