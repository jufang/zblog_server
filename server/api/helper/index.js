'use strict';

const _ = require('lodash');

export function createPagination(model, defaultOptions) {
    const limit = defaultOptions.limit || 20;
    const pageDefault = defaultOptions.page || 1;
    return async function(ctx, next) {
      const conditions =  {};
      const page = ctx.query.page ? Number.parseInt(ctx.query.page) : pageDefault;
      const total = await model.count(conditions);
      /**
       * @name pagination
       * @type {"meta":{ "pagination":{"page":page,"limit":per_page,"total":total},},"posts":[*]}
       */
      ctx.data= {
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
          }).select('title published_at accepted')
          .sort({ created_at: -1 })
      };
      await next();
    }
}
export function createClientPagination(model, defaultOptions) {
    const limit = defaultOptions.limit || 20;
    const pageDefault = defaultOptions.page || 1;
    return async function(ctx, next) {

      const conditions =  ctx.conditions || {};
      const page = ctx.query.page ? Number.parseInt(ctx.query.page) : pageDefault;
      const total = await model.count(conditions);
      /**
       * @name pagination
       * @type {"meta":{ "pagination":{"page":page,"limit":per_page,"total":total},},"posts":[*]}
       */
      ctx.data= {
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
          })
          .select('title published_at lead_sentence tags')
          .populate({path:'tags',select: 'text'})
          .sort({ created_at: -1 })
      };
      await next();
    }
}
export function transTargetType(data){
  return _.map(data,function(d){
    return _.mapKeys(d,(v,k)=>{
      if(k=='target_type'){
        return 'targetType'
      }else{
        return k
      } 
    })
  })
}

export function status(accepted,time){
  if(!accepted) return 0;
  if(+time >= +new Date()){
    return 1
  }else{
    return 2
  }
}