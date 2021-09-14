const mongoose = require('mongoose');
const Schema = mongoose.Schema


const User = require('./user')
const Event = require('./event')


//for images aka- for cloudinary
const ImageSchema = new Schema({
    url:String,
   filename: String
})



const OrganizationSchema = new Schema({
    //name of the organizer
    name: {
        type: String,
    },
    //unique organizer id
    organizationId:{
        type: String,
        unique:true,
        required:true
    },
    bio:{
        type: String,
    },
    about:{
        type:String
    },
    externalUrl:{
        type:String
    },
    
    //events held by the organizations
    events:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Event'
        }
    ] ,
    // members of the organization who will handle events.
    eventmanagers:[
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    //members of the organizers.
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    //banner image for the organization's profile
    bannerImage:ImageSchema,
    //logo of the organization
    logo:ImageSchema
});

module.exports = mongoose.model('Organization', OrganizationSchema)
