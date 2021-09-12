const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const EventSchema = new Schema ({
    //Event Organizer
    Organization:{
        type:String,
        required:true
    },
    //Name of The event
    name:{
        type:String,
        required:true
    }, 
    //Start of the event
    startDate:{
        type:Date,
        required:true,
        default: Date.now()
    },
    endDate:{
        type:Date,
        required:true,
        default: Date.now()
    },
    participants:[
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    Winners:[
        {
            user:{
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            awards:{
                type: Schema.Types.ObjectId,
                ref: 'Award'
            }
        }
    ]

})

module.exports = mongoose.model('Event', EventSchema);