// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router({
    prefix: '/api'
});

// Security
const jwtDecoder = require('../security/jwt').decoder();
// const rbac = require('../security/rbac').rbac;

// Routes
const samRoute = require('./sam');
const userRoute = require('./user');
const profileRoute = require('./profile');
const authRoute = require('./auth');

// Auth Routes
router.use( authRoute.routes(), authRoute.allowedMethods());

// Api Secured routes
const securedRoutes = [samRoute, userRoute, profileRoute];
// const check = rbac.check({'allow': 'admin'});

securedRoutes.forEach(rt=> {
    router.use( jwtDecoder,  rt.routes(), rt.allowedMethods());
});


module.exports = router;
