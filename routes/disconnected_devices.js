
const express = require('express');
const router = express.Router();

const disconnectedDevicesService = require('../services/disconnected_devices');

router.get('/', async (req, res)=>{
    try{
        console.log('get-device 1')
        const fileData = await disconnectedDevicesService.getCsvFile();
        console.log('get-device 2')
        await disconnectedDevicesService.startProcess(fileData);
        console.log('get-device 3')
        // console.log('fileData');

        // return res.send('fileData');
        return res.send(fileData);
    } catch(err){
        return res.send(err);
    }

});

module.exports = router;
