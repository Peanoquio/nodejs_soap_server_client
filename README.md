# nodejs_soap_server_client
An example to illustrate a SOAP server and a SOAP client set-up and interaction

## Usage

To run a sample of how this works:
* Run `npm install`
* Run the SOAP server by typing this on the command line: `node soap_server.js`
* Once the server is up and running, you can access the hosted WSDL file through this URL:
```
http://127.0.0.1:8001/soap?wsdl
```
* To make SOAP requests, simply start the SOAP client (in another terminal) by typing this on the command line: `node soap_client.js`

## Dependencies

For the dependencies, you can refer to [package.json](package.json) 

