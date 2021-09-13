const { cloudinary } = require('../cloudinary');

const Event = require('../models/event');
const Organization = require('../models/organization')



//to get all the events of the organizations  a seperate get req will be made for all the events happening
module.exports.index = async(req, res)=>{
    const organizations = await Organization.find({});
        res.json(organizations)
}
module.exports.createOrganization= async(req,res,next)=>{
    let {name, organizationId, externalUrl, about, bio } = req.body.organization;
    const organization = new Organization({name, organizationId, bio, about, externalUrl});
    if(req.files.logo[0]){
        organization.logo = {url: req.files.logo[0].path, filename: req.files.logo[0].filename}
    }
    if(req.files.bannerImage[0]){
        organization.bannerImage = {url: req.files.logo[0].path, filename: req.files.logo[0].filename}
    }
    await organization.save();
    req.flash('success', 'Successfully made a new event!')
    res.send(organization);
    }

module.exports.showOrganization = async (req,res)=>{
    let organization = await Organization.findOne({organizationId:req.params.organizationId}).populate('members').populate('eventmanagers');
    if(!organization){
        req.flash('error', 'Cannot find the specified organization')
            res.redirect(`/organizations/`)
    }
    const activeEvents = await Event.find({organization: organization._id, completed:false});
    const completedEvents = await Event.find({organization: organization._id, completed:true});
    res.json({organization, activeEvents, completedEvents})
    }

module.exports.editOrganization = async (req,res)=>{
        const organization = await Organization.findOneAndUpdate({organizationId: req.params.organizationId}, {...req.body.organization});
        if(req.files.logo){
            await cloudinary.uploader.destroy(organization.logo.filename);
            organization.logo = {url: f.path, filename: f.filename}
        }
        if(req.files.bannerImage){
            await cloudinary.uploader.destroy(organization.bannerImage.filename);
            organization.bannerImage = {url: f.path, filename: f.filename}
        }
        await organization.save();
        req.flash('success', 'Successfully updated the organization details!')
        res.redirect(`/organizations/${req.params.organizationId}`);
    }

module.exports.deleteOrganization = async (req,res)=>{
    const organization = await Organization.find({eventId:req.params.organizationId});
    /* deleting events to be included */

    await cloudinary.uploader.destroy(organization.bannerImage.filename);
    await cloudinary.uploader.destroy(organization.logo.filename);
    await organization.findByIdAndDelete(organization._id);
    req.flash('success', 'Successfully deleted event. :(')
    res.redirect('/organizations/')
    }

/* add/remove members function to be added yet, */