var mongoose = require('mongoose'),
    crypto = require('crypto');

var AuthorSchema = new mongoose.Schema({
    email: { type:String,required: true, unique: true},
    encrypted_password: { type:String,required: true},
    image:String,
    name: { type:String,required: true},
    introduction:String,
    description:String,
    access_token:String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

// // 定义一个静态方法
// AuthorSchema.statics.hashPassword = hashPassword;

// // 实例方法
// AuthorSchema.methods.correctPassword = function(password) {
//   return !!this.salt && hashPassword(password, this.salt) === this.password;
// };

// // hashes password for secure storage
// function hashPassword(plainText, salt) {
//     var hash = crypto.createHash('sha1');
//     hash.update(plainText);
//     hash.update(salt);
//     return hash.digest('hex');
// }

// // combines above functions for password save and update handling
// function handlePasswordChange(next) {
//     if (this.isModified('password')) {
//         this.salt = crypto.randomBytes(16).toString('base64'); // generates a random string to be added to the user's password prior to hashing, an extra security measure
//         this.password = this.constructor.hashPassword(this.password, this.salt);
//     }
//     next();
// }

// AuthorSchema.pre('save', handlePasswordChange);  // runs 'handlePasswordChange' prior to 'save' action
// AuthorSchema.pre('update', handlePasswordChange);  // runs 'handlePasswordChange' prior to 'update' action

// 创建User的model
export default mongoose.model('Author', AuthorSchema);
