const soap = require('soap');

const url = 'http://127.0.0.1:8001/soap?wsdl';

const nickname = 'Peanoquio';

// create the SOAP client
soap.createClientAsync(url).then(async (client) => {
    console.log('describe the available SOAP services that the client can access', client.describe());

    // NOTE: the SOAP functions in the server are automatically generated with the asynchronous versions of it 
    // (appended with Async suffix)

    const message = `Hi there ${nickname}, the time is ${new Date().getTime()}`;
    let result = await client.PostMessageAsync({ nickname, message });

    // result is a javascript array containing result, rawResponse, soapheader, and rawRequest
    // result is a javascript object
    // rawResponse is the raw xml response string
    // soapHeader is the response soap header as a javascript object
    // rawRequest is the raw xml request string
    console.log('SOAP client call PostMessage result:', result);

    const jsonObj = result[0];
    if (jsonObj && jsonObj.hasOwnProperty('resultcode')) {
        if (jsonObj.resultcode) {
             result = await client.GetNumOfMessagesAsync({ nickname });
             console.log('SOAP client call GetNumOfMessages result:', result);

             const msgIndex = result[0] ? (result[0].number - 1) : 0;
             result = await client.RetrieveMessageAsync({ nickname, number: msgIndex });
             console.log('SOAP client call RetrieveMessage result:', result);
        }
    }

}).catch(err => {
    console.error('SOAP client call error:', err);
});