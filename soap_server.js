const express = require('express');
const soap = require('soap');
const bodyParser = require('body-parser');
const xml = require('xml');


// the message container
const msgContainer = {};

// the result codes
const RESULT_CODE = {
    FAIL: -1,
    NONE: 0,
    NEW: 1,
    EXISTING: 2,
};

/**
 * The web services exposed in the SOAP server
 */
const myService = {
    MySoapProvider: {
        MySoapProviderPort_0: {
            /**
             * Store the message based on the nickname
             */
            PostMessage: (args) => {
                const { nickname, message } = args;
                let resultcode = RESULT_CODE.NONE;
                if (msgContainer.hasOwnProperty(nickname)) {
                    msgContainer[nickname].push(message);
                    resultcode = RESULT_CODE.EXISTING;
                } else {
                    msgContainer[nickname] = [ message ];
                    resultcode = RESULT_CODE.NEW;
                }
                let msgCounter = msgContainer[nickname].length;
                console.log(`PostMessage nickname:${nickname} message:${message} counter:${msgCounter}`);
                return { resultcode };
            },
            /**
             * Get the number of messages based on the nickname
             */
            GetNumOfMessages: (args) => {
                const { nickname } = args;
                let numOfMsgs = 0;
                if (msgContainer.hasOwnProperty(nickname)) {
                    numOfMsgs = msgContainer[nickname].length;
                }
                console.log(`GetNumOfMessages nickname:${nickname} numOfMsgs:${numOfMsgs}`);
                return { number: numOfMsgs };
            },
            /**
             * Retrieve the message based on the nickname and message number
             */
            RetrieveMessage: (args) => {
                const { nickname, number } = args;
                let message = '';
                if (msgContainer.hasOwnProperty(nickname)) {
                    const msgContainerOfPerson = msgContainer[nickname];
                    if (msgContainerOfPerson.hasOwnProperty(number)) {
                        message = msgContainerOfPerson[number];
                    }
                }
                return { message };
            },
        },
    }
};

// read the wsdl file
const wsdlXml = require('fs').readFileSync('./wsdl/mysoap.wsdl', 'utf8');

const app = express();
const PORT = 8001;

// body parser middleware are supported (optional)
app.use(bodyParser.raw({ type: function() {
    return true;
}, limit: '5mb' }));

app.listen(PORT, () => {
    console.log(`express app listening at port: ${PORT}`);
    // Note: /call_soap route will be handled by soap module and all other routes & middleware will continue to work
    // the route also maps to the service -> port -> address location in the wsdl file
    soap.listen(app, '/call_soap', myService, wsdlXml);
});

app.get('/', (req, res) => res.send('Hello World!'));

// http://127.0.0.1:8001/soap?wsdl
app.get('/soap', (req, res) => {
    if (req.query.hasOwnProperty('wsdl')) {
        res.set('Content-Type', 'text/xml');
        res.send(wsdlXml);
    }
});
