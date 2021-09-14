const mongoose = require('mongoose');
const Schema = mongoose.Schema


const User = require('./user')
const Event = require('./event')

const ImageSchema = new Schema({
    url: String,
    filename: String
})

const AwardSchema = new Schema({
    title: {
        type: String,
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    //can be also reffered to as badge, will be of low pixels so that :_: idk we can set an virtual for reduced sizes. :) 
    logo:ImageSchema,
    //points for the specifc award
    points: {
        type: Number,
        min: 0,
        default: 0
    },
    //people who have the award
    winners: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

module.exports = mongoose.model('Award', AwardSchema)
