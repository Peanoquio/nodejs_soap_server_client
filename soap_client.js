const soap = require('soap');
const request = require('request');

// the options to support conneciton persistence and pooling
const optionsForConnPersist = {
    // HTTP agent options
    agentOptions: {
        keepAlive: true,
        // When using the keepAlive option, specifies the initial delay for TCP Keep-Alive packets. 
        // Ignored when the keepAlive option is false or undefined.
        keepAliveMsecs: 60000,
        // By default set to 256. For agents with keepAlive enabled, this sets the maximum number of sockets that will be left open in the free state.
        maxFreeSockets: 1,
    },
    // follow HTTP 3xx responses as redirects
    followRedirect: true,
    followAllRedirects: true,
    // keep-alive 
    forever: true,
    // integer containing number of milliseconds, controls two timeouts
    // Time to wait for a server to send response headers (and start the response body) before aborting the request. 
    // Note that if the underlying TCP connection cannot be established, the OS-wide TCP connection timeout will overrule the timeout option 
    // (the default in Linux can be anywhere from 20-120 seconds).
    // Sets the socket to timeout after timeout milliseconds of inactivity on the socket.
    timeout: 10000,
    // if true, the request-response cycle (including all redirects) is timed at millisecond resolution.
    time: true,
};

// Note that if you are sending multiple requests in a loop and creating multiple new pool objects, 
// maxSockets will not work as intended. To work around this, either use request.defaults with your pool options 
// or create the pool object with the maxSockets property outside of the loop.
const optionsForConnPool = {
    // connection pooling
    pool: {
        // maxSockets property can also be provided on the pool object to set the max number of sockets for all agents 
        maxSockets: 1,
    },
};

const optionsForConnPersistAndPool = Object.assign(optionsForConnPool, optionsForConnPersist);

// persistent request object (based on the specified options)
const persistentRequest = request.defaults(optionsForConnPersistAndPool);

const options = {
    // override the request module
    request: persistentRequest
};

const url = 'http://127.0.0.1:8001/soap?wsdl';


/**
 * The SOAP client factory class
 */
class SoapClientFactory {
    /**
     * Create the SOAP client
     */
    async createSoapClient() {
        try {
            const client = await soap.createClientAsync(url, options);
            this.attachEventListeners(client);
            console.log('describe the available SOAP services that the client can access', client.describe());
            return client;
        } catch(err) {
            console.error('SOAP client error:', err);
        }
    }

    /**
     * Attach the event listeners to the SOAP client
     * @param {Object} client 
     */
    attachEventListeners(client) {
        // SOAP client event listeners
        // Emitted before a request is sent
        client.on('request', (xml, eid) => {
            console.log('SOAP client request event');
            console.log('eid:', eid, 'xml:', xml);
        });
        // Emitted before a request is sent, but only the body is passed to the event handler
        client.on('message', (message, eid) => {
            console.log('SOAP client message event');
            console.log('eid:', eid, 'message:', message);
        });
        // Emitted when an erroneous response is received
        client.on('soapError', (error, eid) => {
            console.error('SOAP client soapError event');
            console.error('eid:', eid, 'error:', error);
        });
        // Emitted after a response is received. This is emitted for all responses (both success and errors). 
        client.on('response', (body, response, eid) => {
            console.log('SOAP client response event');
            console.log('eid:', eid, 'body:', body);
            console.log('response.req.socket.connecting', response.req.socket.connecting);
            console.log('response.request.agentOptions', response.request.agentOptions);
            console.log('response.request.pool', response.request.pool);
        });
    }
} // end class


const soapClientFactory = new SoapClientFactory();
module.exports = { 
    soapClientFactory,
    optionsForConnPersist,
    optionsForConnPool,
};
