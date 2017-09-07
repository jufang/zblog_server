'use strict';

import Koa from 'koa';
import logger from 'koa-logger';
import body from 'koa-body';
import cors from 'kcors';
import routes from './api';
import {config} from './config';

const app = new Koa();
const session = require('koa-session')
const mongoose = require('mongoose');
const MongooseStore = require('koa-session-mongoose');
if(process.env.BLOGEND=='production'){
	mongoose.connect(config.PRODUCT);
}else{
	mongoose.connect(config.DEVELOPMENT);
}

app.use(logger());
app.use(cors());
app.use(body());
app.use(session({
	key: config.SESSION_SECRET,
	maxAge: 86400000,
	store:new MongooseStore(),
	overwrite: true, 
	httpOnly: true, 
	signed: true, 
	rolling: false
},app))
app.use(routes);

export default app;