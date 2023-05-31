const mongoose = require("mongoose");
const argon2 = require('argon2');

/**
 * The user schema
 */
const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    fullname: {
        type: String
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true,
        maxLength: 100
    },
    deliveries: {
        type: Array
    },
    status: {
        type: String
    },
    avatar: {
        type: Buffer
    },
    expoPushToken: {
        type: String || Number
    },
    profilePhoto: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

/**
 * Call the pre api to implement the password hashing.
 */
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            const hash = await argon2.hash(this.password);
            this.password = hash;
            next();
        } catch (err) {
            console.log(err);
        }
    } else {
        next();
    }
})

/**
 * Assign the method comparePassword to the schema.
 * The method compares the provided password with
 * the hashed one stored in the database.
 * 
 * @param { String } password the password value from the user
 * @returns { Boolean} true if the password is correct, otherwise false
 */
UserSchema.methods.comparePassword = async function (password) {
    console.log(password)
    if (!password) {
        return res.json({ success: false, error: 'Password is missing, provide one and try again.'});
    }
    try {
        const result = await argon2.verify(this.password, password);
        return result;
    } catch (error) {
        console.log("incorrect password");
    }
}

module.exports = mongoose.model("User", UserSchema);
