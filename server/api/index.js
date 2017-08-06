'use strict';

import Router from 'koa-router';
import author from './cms/author';
import post from './cms/post';
import client from './client/index';

const router = new Router();

router.use(async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        ctx.status = 400;
        ctx.body = {
            code: error.code,
            message: error.message || error.errmsg || error.msg || 'unknown_error',
            error
        };
    }
});
router.use('/api/v1',client);
router.use(author);
router.use(post);


export default router.routes();