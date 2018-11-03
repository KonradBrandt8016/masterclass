const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const fs = require("fs");
const env = require("./config");

const httpPort = env.httpPort;
const httpsPort = env.httpsPort;

const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

httpServer.listen(httpPort, () => {
  console.log(
    "HTTP Server Listening on port " + httpPort,
    "Environment: " + env.envName
  );
});

const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem")
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

httpsServer.listen(httpsPort, () => {
  console.log(
    "HTTPS Server Listening on port " + httpsPort,
    "Environment: " + env.envName
  );
});

// define the route handlers
const handlers = {};

handlers.ping = (data, callback) => {
  callback(200);
};

handlers.hello = (data, callback) => {
  callback(200);
};

handlers.notFound = (data, callback) => {
  callback(404);
};

// define a request router
const router = {
  ping: handlers.ping,
  hello: handlers.hello
};

const unifiedServer = (req, res) => {
  // get the parsed url
  const parsedURL = url.parse(req.url, true);
  // get the requested path
  const path = parsedURL.pathname;
  // remove trailing and leading bits of path
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  // get the request method
  const method = req.method.toUpperCase();
  // get the query string parameters
  const queryStringObj = parsedURL.query;
  // get the headers sent with request
  const headersObj = req.headers;
  // get the body payload of the request
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", data => {
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();
    const routedPath =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;
    // construct the data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      method: method,
      queryStringObj: queryStringObj,
      headersObj: headersObj,
      payload: buffer
    };
    routedPath(data, (status, payload) => {
      // use the status called back by the handler or default to 200
      status = typeof status == "number" ? status : 200;
      // status ? status : 200; wouldn't this work?
      // use the payload called back by the handler or default to {}
      payload = typeof payload == "object" ? payload : {};
      const payloadString = JSON.stringify({ message: "Hello, World!" });
      // const payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      res.writeHead(status);
      // res.write(`Hello, world!`);
      res.end(payloadString);
    });
  });
};
