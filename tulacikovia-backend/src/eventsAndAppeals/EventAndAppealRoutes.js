const express = require('express')
const router = express.Router();
const {EventsAndAppealsManager} = require("./EventsAndAppealsManager");
const { Authenticator } = require('../authentication/AuthService');
const { log } = require('console');
const { measureMemory } = require('vm');
const internal = require('stream');
const { AppealType, Appeal } = require('../models/AppealModel');

module.exports = router;


//! DO NOT USE
router.post('/createEventOrAppeal', Authenticator.UserAuth, async(req,res)=>{
    try {
        const {type, name, tag, description, picture, location, startDate, endDate } = req.body;

        var author = req.subject.userProfile.type; // verifying if user can create events/appeals
        
        console.log("ACC TYPE",author)

        if(author.type != "ORGANIZATION"){
            res.status(200).json({ message: 'You are not allowed to create Appeal', author: author.type});
            return;
        }

        const manager = new EventsAndAppealsManager();
        const sameName = await manager.isActiveEventOrAppealWithSameName(name);

        if(manager.atributesVerification(type,description,picture,location,startDate,endDate)){
            res.status(200).json({ message: 'Wrong event/appeal atributes'});
            return
        }
        if(sameName){
            res.status(200).json({ message: 'Appeal with same name already exists'});
            return       
        }
        
        var result
        if(type == "APPEAL"){
            result = await manager.createAppeal(author.email,name,tag,description,picture,location,startDate);
        }else{
            result = await manager.createEvent(author.email,name,tag,description,picture,location,startDate,endDate);
        }
                
        res.status(201).json({ message: 'Appeal created successfully', result});
    } catch (error) {
        console.error('Error creating appeal:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//! DO NOT USE
router.post('/editEventOrAppeal/:id', Authenticator.UserAuth, async(req,res)=>{
    try{
        const {id,status, name, tag, description, picture, location, startDate} = req.body;
        const manager = new EventsAndAppealsManager();

        const editor = req.subject.userProfile.email;
        const organizator = await manager.getOrganizator()

        //comparing email addressessS
        const verification = manager.verifyEditor(editor,organizator);
        if(verification){

            const result = await manager.editEventOrAppeal(id,status,name,tag,description,picture,location,startDate);
            res.status(202).json({message: "Post successfully edited."})
        }else{
            res.status(200).json({message: "Your are not alowed to edit this post."})
        }
    }catch(error){
        console.error('Error editing appeal:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/content/create/appeal', Authenticator.UserAuth, async(req, res) => {
    // Identify type of the appeal
    if(req.body.type == undefined) throw new Error('Unable to parse content type, insert denied.');

    try {
        // verifying if user can create events/appeals
        var author = req.subject.userProfile; 
        if(author.type != "ORGANIZATION") return res.status(500).json({ error: 'You are not allowed to create Appeal'});
        
        // Parse content with general type
        const manager = new EventsAndAppealsManager();
        const contentId = await manager.processWithGeneralType('create', req.body, author.uid);

        res.status(200).json({ state: 'inserted', objectId: contentId });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
})

router.post('/content/update/appeal', Authenticator.UserAuth, async(req, res) => {
    // Identify type of the appeal
    if(req.body.type == undefined) throw new Error('Unable to parse content type, update denied.');

    try {
        // verifying if user can create events/appeals
        var author = req.subject.userProfile; 
        if(author.type != "ORGANIZATION") return res.status(500).json({ error: 'You are not allowed to create Appeal'});
        
        // Parse content with general type
        const manager = new EventsAndAppealsManager();
        console.log('Received: ' + JSON.stringify(req.body));
        try {
            const contentId = await manager.processWithGeneralType('update', req.body, author.uid);
            res.status(200).json({ state: 'updated', objectId: contentId });
        } catch(ex) {
            res.status(200).json({ state: 'skipped', message: 'Object was not updated.'});
        }
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
})

router.post('/content/appeals/delete', Authenticator.UserAuth, async(req, res) => {

    try {
        const {id} = req.query;
        const appeal = req.body;

        // verifying if user can create events/appeals
        var author = req.subject.userProfile; 
        
        // Parse content with general type
        const manager = new EventsAndAppealsManager();
        const deleted = await manager.deleteAppeal(id ?? appeal, author.uid);

        res.status(deleted ? 200 : 500).json({ state: deleted ? 'deleted' : 'error', message: deleted ? 'Appeal successfully deleted.' : 'Could not delete due to uknown error.' });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
})

router.get('/content/list/appeals', Authenticator.UserAuth, async(req, res) => {

    try {
        const {limit, sortBy, sort, applyFilters, params} = req.query;

        // verifying if user can create events/appeals
        var author = req.subject.userProfile; 
        
        // Parse content with general type
        const manager = new EventsAndAppealsManager();
        const content = await manager.getListWithGeneralType(author.uid, applyFilters.toString().split(','), { limit: limit, sortBy: sortBy, sort: sort }, parseInt(req.query.lastIndex) ?? 0, params ? params.split(',') : params)

        res.status(200).json({ state: 'listed', list: content });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
})

router.get('/content/list/myParticipations', Authenticator.UserAuth, async(req, res) => {

    try {
        const {limit, sortBy, sort} = req.query;

        // verifying if user can create events/appeals
        var author = req.subject.userProfile; 
        
        // Parse content with general type
        const manager = new EventsAndAppealsManager();
        const content = await manager.getListFromUserPaticipations(author.uid, { limit: limit, sortBy: sortBy, sort: sort }, req.query.startFrom ?? undefined)

        res.status(200).json({ state: 'listed', list: content });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
})

router.get('/content/get/appeals', Authenticator.UserAuth, async(req, res) => {

    try {
        const {ids} = req.query;

        console.log('Appeal ids: ' + ids);
        
        // Parse content with general type
        const manager = new EventsAndAppealsManager();
        const content = await manager.getListByIDs(ids.split(','));

        res.status(200).json({ state: 'listed', list: content });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
})

router.post('/content/appeals/participate', Authenticator.UserAuth, async(req, res) => {

    try {
        const {appeal} = req.query;
        var subjectPerson = req.subject.userProfile; 

        if(appeal == undefined) { res.status(500).json({ state: 'appeal_undefined', error: 'Target appeal is not provided by the caller.' }); return; }
        if(subjectPerson.uid == undefined) { res.status(500).json({ state: 'user_undefined', error: 'User id in the authenticator entity is not provided.' }); return; }
        
        var parId = await Appeal.participateOn(appeal, subjectPerson.uid);
        res.status(200).json({ state: 'success', id: parId });
    } catch (ex) {
        res.status(500).json({ state: 'error', error: ex.message });
    }
    
});

router.post('/content/appeals/unparticipate', Authenticator.UserAuth, async(req, res) => {

    try {
        const {appeal} = req.query;
        var subjectPerson = req.subject.userProfile; 

        if(appeal == undefined) res.status(500).json({ state: 'appeal_undefined', error: 'Target appeal is not provided by the caller.' });
        if(subjectPerson.uid == undefined) res.status(500).json({ state: 'user_undefined', error: 'User id in the authenticator entity is not provided.' });
        
        var parId = await Appeal.unparticipateFrom(appeal, subjectPerson.uid);
        if(parId > 0) res.status(200).json({ state: 'success' });
        else res.status(500).json({ error: 'Could not remove parcitipation for this user.' });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
});

router.get('/content/appeals/participated', Authenticator.UserAuth, async(req, res) => {

    try {
        const {appeal} = req.query;
        var subjectPerson = req.subject.userProfile; 

        if(appeal == undefined) res.status(500).json({ state: 'appeal_undefined', error: 'Target appeal is not provided by the caller.' });
        if(subjectPerson.uid == undefined) res.status(500).json({ state: 'user_undefined', error: 'User id in the authenticator entity is not provided.' });

        res.status(200).json({ state: 'success', participated: await Appeal.isParticipated(subjectPerson.uid, appeal) });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
});


//?IT WORKS I GUESS
router.get('/getEventOrAppeal/:id', async(req,res)=>{
    const {id} = req.body;
    try {
        //? By which atribute get certain EventOrAppeal
        //! object ID i guess

        const manager = new EventsAndAppealsManager()
        const result = await manager.getEventOrAppeal(id)
        res.status(200).json(result)

    } catch (error) {
        console.error("Error while trying to get Event or Appeal",error)
        res.status(500).json({error: "Internal Server Error"});
    }
})


