
const csv = require('csv-parser')
const fs = require('fs')
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const authorization = {
    gsm_bpm:{
        stage:"ZGFyaW9fYmxvb2RfcHJlc3N1cmVfbW9uaXRvcjpsQkF3OW9WRmRjZk9rTUVYWXc4N0dKcnQ4RnBRTWdLV1piR3cwYXQ4",
        prod:"ZGFyaW9fYmxvb2RfcHJlc3N1cmVfbW9uaXRvcjpTTEdJdm15RHNycThXcEUxS21ZMXl6Vng4YTNNYkZqTndZRTZtdjR1"
    },
    gsm_scale:{
        stage:"ZGFyaW9fZ3NtX3NjYWxlOnRPUHgzTzdXS2FWb0tKMVRWaEhmZ1V5ZlUxdGtRT2hUSnFQT0VGdzk=",
        prod:"ZGFyaW9fZ3NtX3NjYWxlOjlIc0RnRmlXUHAzcFhKekQ1SDB1aEpXakRFQzhRVGliWElNc1I5NU4"
    }
}

const devicesData = {
    gsm_bpm: {
        clientId:"dario_blood_pressure_monitor",
        authorization: authorization.gsm_bpm.prod,
        model: "081",
        series: "001"
    },
    gsm_scale:{
        clientId:"dario_gsm_scale",
        authorization: authorization.gsm_scale.prod,
        model: "082",
        series: "001"
    }
}
const deleteProvError = [];
const addProvError = [];

module.exports = {
    getCsvFile: async () => {
        const results = [];
        return await new Promise((resolve, reject) => {
            fs.createReadStream('./csv/ext_test.csv')
              .pipe(csv())
              .on('data', (data) => results.push(data))
              .on('end', () => {
                // console.log('end', results)
                resolve(results);
              })
              .on('error', (error) => {
                reject(error);
              });
          });
    },
    startProcess: async (fileData) => {

        for(let obj of fileData){
            console.log(obj.IMEI, obj.email)
            //await deleteProvisioning(obj.TYPE, obj.provisioning_id) //('gsm_scale','7CefBi');
            //await addProvisioning(obj.TYPE, obj.email,obj.IMEI) //('gsm_scale', 'nitzanv+cfhc130821@mydario.com', 'gsmScaleAutoTest08') 
        }

        console.log('deleteProvError',deleteProvError)
        console.log('addProvError',addProvError)
        if(deleteProvError.length || addProvError.length){
            try {
                const csvWriter = createCsvWriter({
                    path: 'serial-errors-output.csv'
                });
                const csv = await csvWriter.writeRecords([...deleteProvError,...addProvError]);
                console.log('CSV file successfully written');
            } catch (error) {
                console.error('Error writing CSV file:', error);
            }
        }
    }
}

async function deleteProvisioning(productType, provisioningId){
    try{
        console.log('deleteProvisioning', productType, provisioningId, `Basic ${devicesData[productType].authorization}`);
        
        const response = await axios.delete(`https://api.dariocare.com/provisioning/${provisioningId}`, {
            responseType: 'json',
            headers: { 
                'Authorization': `Basic ${devicesData[productType].authorization}`, 
                'Content-Type': 'application/json'
              }
          });
      
          const data = response.data;
          if(data.status != 200){
            deleteProvError.push({data,productType, provisioningId})
          }
          console.log('data', data)
    } catch(error){
        console.log(error);
    }
}

async function addProvisioning(productType, email, IMEI){
    try{
        console.log('addProvisioning', productType, email,IMEI, `Basic ${devicesData[productType].authorization}`);

        const data = JSON.stringify({
            email,
            meta_data: {
              connected_device: {
                model: devicesData[productType].model,
                serial: IMEI,
                series: devicesData[productType].series
              }
            }
        });
        //console.log('data', data)

        const response = await axios.post(
            `https://api.dariocare.com/provisioning/`, 
            data, 
            { headers: { 
                'Authorization': `Basic ${devicesData[productType].authorization}`, 
                'Content-Type': 'application/json'
            }}
        );
      
          const res = response.data;
          if(res.status != 200){
            addProvError.push({res,productType, email})
          }
          console.log('res', res)
    } catch(error){
        console.log(error);
    }
}