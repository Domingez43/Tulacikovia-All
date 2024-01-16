const express = require('express');
const { UserDataManager } = require('./UserData');
const router = express.Router();

// const {UserDataEditor} = require('./UserData');

module.exports = router

router.post('/accountDetails', async (req, res) => {
    const {role} = req.body;
    const userDataEditor = new UserDataManager;
    
    if(role == "organization"){
        res.status(200).json({mesage:"PARADA"});
    }else if(role == "user"){
        const{userID, name, profilePicture} = req.body;
        const result = await userDataEditor.updateUserData(userID, name,profilePicture);
        res.status(200).json({mesage: result});
    }else{
        res.status(400).json({message:"Something went wrong"});
    }
});