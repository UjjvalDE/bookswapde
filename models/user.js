const crypto = require('crypto');

// Add md5 function
function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email_verify: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    temp: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    country_code: {
        type: String,
        required: true,
        default: "+49"
    },
    number: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    postcode: {
        type: Number,
        required: true
    },
    interestedBooks: {
        type: [String],
        required: true,
        default: []
    },
    profile_img: {
        type: String,
        default: "cat"
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// Add method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpires = Date.now() + 3600000;
    return resetToken;
};

// Add pre-save middleware to hash password
userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        this.password = md5(this.password);
    }
    next();
});

const userModal = mongoose.model('user', userSchema);
module.exports = userModal;