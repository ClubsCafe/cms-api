const { cloudinary } = require('../cloudinary');

const Event = require('../models/event');
const Award = require('../models/award')


//to get all the events of the organizations  a seperate get req will be made for all the events happening
module.exports.index = async(req, res)=>{
    let currentEvent = Event.find({eventId:req.params.eventId})
    const awards = await Award.find({event: currentEvent._id});
    res.json(awards)
}
module.exports.createAward= async(req,res,next)=>{
    let event = Event.find({eventId:req.params.eventId});
    let {title, points} = req.body.award;
    const award = new Event(title, points);
    if(req.file){
        award.logo = {url: req.files.logo.path, filename: req.files.logo.filename}
    }
    award.event = event._id;
    await award.save();
    event.awards.push(award._id);
    event.save()
    req.flash('success', 'Successfully made a new event!')
    res.redirect(`/organizations/${req.params.organizationId}/events/${eventId}/`)
    }

module.exports.showAward = async (req,res)=>{
        const award = await Award.findById(req.params.awardId).populate('event').populate('winners');
        if(!award){
            req.flash('error', 'Cannot find the specified award')
            res.redirect(`/organizations/${req.params.awardId}/events/${req.params.eventId}`)
        }
        res.json(award);
    }

module.exports.editAward = async (req,res)=>{
        const award = await Award.findByIdAndUpdate(req.params.awardId, {...req.body.award});
        if(req.file){
            await cloudinary.uploader.destroy(award.logo.filename);
            award.logo = {url: req.file.path, filename: req.file.filename}
        }
        await award.save();
        req.flash('success', 'Successfully updated the award!')
        res.redirect(`/organizations/${req.params.organizationId}/events/${req.params.eventId}/`);
    }

module.exports.deleteAward = async (req,res)=>{
    const award = await Award.findById(req.params.awardId);
    const event = await Event.findOneAndUpdate({eventId:req.params.eventId}, {$pull: {awards:award._Id}})
    for(winner of award.winners){
        User.findByIdAndUpdate(winner,{$pull: {awards:award._Id}, $inc : { "points" : -award.points }})
    }
    await cloudinary.uploader.destroy(award.bannerImage.filename);
    await cloudinary.uploader.destroy(award.logo.filename);
    await Award.findByIdAndDelete(award._id);
    req.flash('success', 'Successfully deleted the award. :(')
    res.redirect(`/organizations/${req.params.organizationId}/events/${req.params.eventId}/`)
    }

module.exports.giveAward = async (req,res)=>{
    let winners = req.body.winners;
    let award = Award.findById(req.params.awardId)
    /* Have a doubt here */
    //here winners will be an array of usernames not the objectId:v
    await User.updateMany({username: {$in: winners}}, {$push: {awards:req.params.awardId}, $inc : { "points" : award.points }})
    res.send("Success");
    req.flash('success', 'Successfully awarded the users')
    res.redirect(`/organizations/${req.params.organizationId}/events/${eventId}/`)
}