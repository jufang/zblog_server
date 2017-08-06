'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var moment = require('moment');

var PostSchema = new Schema({
    title: {
        type:String,
        required: true
    },
    accepted: {
        type:Boolean,
        default:false
    },
    lead_sentence:String,
    items:Array,
    tags:[{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Tag'
    }],
    published_at: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now,
        index:true
    },
}, {
    toJSON: {
        virtuals: true,
        transform(doc, ret){
            ret.leadSentence =ret.lead_sentence,
            ret.publishedAt = moment(ret.published_at).format("YYYY/MM/DD"),
            ret.status =  status(ret.accepted,ret.published_at),
            ret.id = ret._id;
            ret.v = ret.__v;
            delete ret.published_at;
            delete ret._id;
            delete ret.__v;
            delete ret.lead_sentence;
        }
    }
})
function status(accepted,time){
  // 0: not accepted, 1: will publish, 2: publishing
  if(!accepted) return 0;
  if(+time >= +new Date()){
    return 1
  }else{
    return 2
  }
}
export default  mongoose.model('Post', PostSchema);

