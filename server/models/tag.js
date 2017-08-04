var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var TagSchema = new Schema({
    text: {type: String, required: true },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
}, {
    toJSON: {
        virtuals: true,
        transform(doc, ret){
            ret.id = ret._id;
            ret.v = ret.__v;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.model('Tag', TagSchema);