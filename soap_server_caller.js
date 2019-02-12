const express = require('express');
const url = require('url');
const http = require('http');
const { soapClientFactory, optionsForConnPersist, optionsForConnPool } = require('./soap_client');

const app = express();
const PORT = 8002;

// create the HTTP server
const server = http.createServer(app);
//server.keepAliveTimeout = 30 * 1000;


// middlewares to help process HTTP requests
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from the other world!!!');
});

app.get('/makeSoapCall', async (req, res) => {
    // create the SOAP client
    const soapClient = await soapClientFactory.createSoapClient();

    // NOTE: the SOAP functions in the server are automatically generated with the asynchronous versions of it 
    // (appended with Async suffix)

    const nickname = 'Peanoquio';
    const message = `Hi there ${nickname}, the time is ${new Date().getTime()}`;
    //let result = await client.PostMessageAsync({ nickname, message });

    soapClient.PostMessage({ nickname, message }, async (err, result, rawResponse, soapHeader, rawRequest) => {
        // result is a javascript object
        // rawResponse is the raw xml response string
        // soapHeader is the response soap header as a javascript object
        // rawRequest is the raw xml request string
        console.log('SOAP client call PostMessage result:', result);

        if (result && result.hasOwnProperty('resultcode')) {
            if (result.resultcode) {
                let resultArr = await soapClient.GetNumOfMessagesAsync({ nickname });
                console.log('SOAP client call GetNumOfMessages result:', resultArr);

                const msgIndex = resultArr[0] ? (resultArr[0].number - 1) : 0;
                resultArr = await soapClient.RetrieveMessageAsync({ nickname, number: msgIndex });
                console.log('SOAP client call RetrieveMessage result:', resultArr);
            }
        }
    }, optionsForConnPersist);

    res.send(`${nickname} made a SOAP request`);
});

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

// event listeners
// This event is emitted when a new TCP stream is established. socket is typically an object of type net.Socket.
server.on('connection', (socket) => {
    console.log('----- A connection was made by a client!!!');
});

// Emitted each time there is a request. Note that there may be multiple requests per connection (in the case of HTTP Keep-Alive connections).
server.on('request', (req, res) => {
    console.log('----- A request was made by a client!!!');
});