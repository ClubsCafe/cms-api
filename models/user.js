const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

// requiring other schemas (awards and events here)
/* yet to be created */
const ImageSchema = new Schema({
    url:String,
   filename: String
})

const UserSchema = new Schema ({
    email:{
        type:String,
        required: [true , "Email cannot be Empty"],
        unique: true
    },
    userType: {
        type:String,
        required:true,
        enum: ["admin","eventmanager", "mod", "user"],
        default: "user"
    },/* 
     eventmanager can create events or we can make it such that 
     any normal user can create events but a mod has to accept those events */
    dob: { type: Date, 
        default: Date.now ,
        required: [true, "DOB cannot be Empty"]
    },
    name:{
        type:String,
        required: [true, "Name cannot be Empty"]
    },
    bio: {
        type:String,
    },
    awards:[
        {
            type: Schema.Types.ObjectId,
            ref: 'awards'
        }
    ],
    events: [
        {
            type: Schema.Types.ObjectId,
            ref: 'events'
        }
    ],
    avatar: ImageSchema //for avatars or so called profile pictures
}, { timestamps: true }) //for knowing the date of creationg


//integrating passport with UserSchema before exporting it as a mongoose model
UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model('User',UserSchema);