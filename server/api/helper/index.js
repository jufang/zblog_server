'use strict';

export function createPagination(model, defaultOptions) {
    const limit = defaultOptions.limit || 20;
    const pageDefault = defaultOptions.page || 1;
    return async function(req, res, next) {
      const conditions =  {};
      const page = req.query.page ? Number.parseInt(req.query.page) : pageDefault;
      const total = await model.count(conditions);
      /**
       * @name pagination
       * @type {"meta":{ "pagination":{"page":page,"limit":per_page,"total":total},},"posts":[*]}
       */
      res.data= {
          meta:{
            pagination:{
              page,
              limit,
              total
            } 
          },
          posts: await model.find(conditions,{}, {
              limit: limit,
              skip: (page - 1) * limit
          }).select('title published_at accepted').sort({ created_at: -1 })
      };
      await next();
    }
}