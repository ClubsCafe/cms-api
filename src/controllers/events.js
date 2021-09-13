const { cloudinary } = require('../cloudinary');

const Event = require('../models/event');
const Organization = require('../models/organization')

//to get all the events of the organizations  a seperate get req will be made for all the events happening
module.exports.index = async(req, res)=>{
    let currentOrganization = await Organization.findOne({ organizationId: req.params.organizationId})
    const events = await Event.find({organization: currentOrganization._id});
    res.json(events)
}
module.exports.createEvent= async(req,res,next)=>{
    let organization = await Organization.findOne({ organizationId: req.params.organizationId})
    let {name, eventId, externalUrl, tags, bio,about, startDate, endDate, Completed} = req.body.event;
    const event = new Event({name, eventId, externalUrl, tags, bio, about, startDate, endDate, Completed});
    if(req.files.logo[0]){
        event.logo = {url: req.files.logo[0].path, filename: req.files.logo[0].filename}
    }
    if(req.files.bannerImage[0]){
        event.bannerImage = {url: req.files.logo[0].path, filename: req.files.logo[0].filename}
    }
    event.organization = organization._id;
    await event.save();
    organization.events.push(event);
    await organization.save();
    req.flash('success', 'Successfully made a new event!')
    res.send(event);
    /* res.redirect(`/organizations/${req.params.organizationId}/events/${eventId}/`) */
    }
module.exports.showEvent = async(req, res)=>{
    const event = await Event.findOne({eventId: req.params.eventId}).populate('organization');
    /* populate other according to needs */
    if(!event){
        req.flash('error', 'Cannot find the specified event')
        res.send("event not found")
        //res.redirect(`/organizations/${req.params.organizationId}/`)
    }
    res.json(event)
}

module.exports.editEvent = async (req,res)=>{
        const event = await Event.findOneAndUpdate({eventId: req.params.eventId}, {...req.body.event});
        if(req.files.logo[0]){
            await cloudinary.uploader.destroy(event.logo.filename);
            event.logo = {url: req.files.logo[0].path, filename: req.files.logo[0].filename}
        }
        if(req.files.bannerImage[0]){
            await cloudinary.uploader.destroy(event.bannerImage.filename);
            event.bannerImage = {url: req.files.logo[0].path, filename: req.files.logo[0].filename}
        }
        await event.save();
        req.flash('success', 'Successfully updated the event!')
        res.redirect(`/organizations/${req.params.organizationId}/events/${req.params.eventId}/`);
    }

module.exports.deleteEvent = async (req,res)=>{
    const event = await Event.findOne({eventId: req.params.eventId});
    await Organization.findByIdAndUpdate(event.Organization, {$pull: {events:event._id}})
    /* Award deletion commands here*/
    await cloudinary.uploader.destroy(event.bannerImage.filename);
    await cloudinary.uploader.destroy(event.logo.filename);
    await event.findByIdAndDelete(event._id);
    req.flash('success', 'Successfully deleted event. :(')
    res.redirect(`/organizations/${req.params.organizationId}`)
    }

/* other functions/routes for registring for events or dergistring for events, etc needs to be added yet */