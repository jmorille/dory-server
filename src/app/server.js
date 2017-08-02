'use strict';

// Utils
const fs = require('fs');
const path = require('path');

// Logger
const logger = require('./logger');

//Server
const http = require('http');
const http2 = require('http2');

const Koa = require('koa');
// const jwt = require('koa-jwt');
const app = new Koa();
const koaBody = require('koa-body');


// Routes
const serve = require('koa-static');
const unless = require('koa-unless');
const apiRoutes = require('./routes/index');

// Config
const config = require('./config');
const encodeJwtTokenInHeadersCookies = require('./security/jwt').encodeJwtTokenInHeadersCookies();
// const rbacMiddleware = require('./security/rbac').middleware;

// Koa Config
const port = process.env.PORT || 8181;
app.use(koaBody());



// look ma, error propagation!
app.use((ctx, next) => {
    return next().catch((err) => {
        ctx.status = err.status || 500;
        ctx.body = {message: err.message, status: ctx.status, errors: err.errors};
        // since we handled this manually we'll want to delegate to the regular app
        // level error handling as well so that centralized still functions correctly.
        ctx.app.emit('error', err, ctx);
        // logger.error(err);
    });
});


// serve staticfiles from ./public
const staticDirectory = path.join(__dirname, '..', 'web');
logger.info('Serve static file ', staticDirectory);
const staticWeb =serve(staticDirectory);
staticWeb.unless = unless;
app.use(staticWeb.unless({path: ['/api']}));

// Security
app.use(encodeJwtTokenInHeadersCookies);
// app.use(rbacMiddleware);

// Api Routes
app.use(apiRoutes.routes()).use(apiRoutes.allowedMethods());

// =======================
// start the server ======
// =======================
const certsDirectory = path.join(__dirname, '..', 'certs');
const certs = {
    key: fs.readFileSync(path.join(certsDirectory, 'server.key')),
    cert: fs.readFileSync(path.join(certsDirectory, 'server.crt'))
};

http2.createServer(certs, app.callback()).listen(port, () => {
    logger.info('Magic  happens at https://localhost:' + port);
});