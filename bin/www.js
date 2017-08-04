'use strict';

import app from '../server';
import {connectDatabase} from '../server/db';
import {config} from '../server/config';
const port = process.env.PORT || 3000;

(async() => {
    try {
        const info = await connectDatabase(config.DEVELOPMENT);
    } catch (error) {
        console.error('Unable to connect to database');
    }

    try {
        await app.listen(port);
        console.log(`Server started on port ${port}`);
    } catch (error) {
        console.log(error);
    }
})();