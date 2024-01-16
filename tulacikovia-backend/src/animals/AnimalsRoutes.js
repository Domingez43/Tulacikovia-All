const express = require('express')
const router = express.Router();
const { Authenticator } = require('../authentication/AuthService');
const { AnimalsProcessing } = require('./AnimalsProcessing');
const { Animal } = require('../models/AnimalsModel');

module.exports = router;

router.post('/content/animals/create', Authenticator.UserAuth, async(req, res) => {

    try {
        // verifying if user can create events/appeals
        var author = req.subject.userProfile; 
        if(author.type != "ORGANIZATION") return res.status(500).json({ error: 'You are not allowed to create Animal profile'});
        
        const validated = await AnimalsProcessing.validateAnimalObject(author.uid, req.body, 'create');
        const profileId = await validated.contentValidation('create').saveToDatabase();
        res.status(200).json({ status: 'CREATED', id: profileId });

    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
});

router.post('/content/animals/update', Authenticator.UserAuth, async(req, res) => {

    try {
        // verifying if user can create events/appeals
        var author = req.subject.userProfile; 
        if(author.type != "ORGANIZATION") return res.status(500).json({ error: 'You are not allowed to create Animal profile'});
        
        const validated = await AnimalsProcessing.validateAnimalObject(author.uid, req.body, 'update');
        const profileId = await validated.contentValidation('update').updateToDabase();
        res.status(200).json({ status: 'UPDATED', id: profileId });
        
    } catch (ex) { 
        res.status(500).json({ error: ex.message });
    }
    
});

router.get('/content/animals/list', Authenticator.UserAuth, async(req, res) => {

    try {
        const {limit, sortBy, sort, applyFilters = [], params} = req.query;

        // verifying if user can create events/appeals
        var author = req.subject.userProfile; 
        
        // Parse content with general type
        const content = await AnimalsProcessing.getList(author.uid, applyFilters.toString().split(','), { limit: limit, sortBy: sortBy, sort: sort }, parseInt(req.query.skip ?? 0), params ? params.split(',') : params)

        res.status(200).json({ state: 'listed', list: content });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
})

router.post('/content/animals/delete', Authenticator.UserAuth, async(req, res) => {

    try {
        const {id} = req.query;
        const animal = req.body;

        // verifying if user can create events/appeals
        var author = req.subject.userProfile; 
        
        // Parse content with general type
        const deleted = await AnimalsProcessing.deleteProfile(id ?? animal, author.uid);

        res.status(deleted ? 200 : 500).json({ state: deleted ? 'deleted' : 'error', message: deleted ? 'Animal profile successfully deleted.' : 'Could not delete due to uknown error.' });
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    }
    
})