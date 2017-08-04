'use strict';

import Router from 'koa-router';
import { createPagination } from '../helper';
import Post from '../..//models/post';
import Tag from '../..//models/tag';
const crypto    = require('crypto');
const moment = require('moment');
const _ = require('lodash');

const router = new Router({
    prefix: '/cms/api/v1'
});

//取文章的列表/posts
router.get('/posts', async (ctx,next)=>{
    await next();
  },
  createPagination(Post, { limit: 20 }),
  async (ctx, next) =>{
    ctx.body = ctx.data;
  }
)

//预览/posts/:id
router.get('/posts/:id',async (ctx,next)=>{
  const id = ctx.params.id
  let post = await Post.findById({_id:id})
              .select('title published_at tags items')
              .populate({path:'tags',select: 'text'})
  const prevPost = await Post.find({_id:{'$lt':id}}).sort({_id:-1}).limit(1)
  const nextPost = await Post.find({_id:{'$gt':id}}).sort({_id:1}).limit(1)
  post.items = transTargetType(post.items)
  post = post.toJSON()
  ctx.body={
    "prevId":prevPost._id,
    "prevTitle":prevPost.title,
    "nextId":nextPost._id,
    "nextTitle":nextPost.title,
  }
})

//创建文章/posts
router.post('/posts',async (ctx,next)=>{
  const body = ctx.request.body.post;
  const curPost = new Post({
    title:body.title,
    published_at:body.published_at,
    lead_sentence:body.lead_sentence,
    items:body.items_attributes.map((v)=>{
      return _.omit(v,['is_new','editing'])
    })
  })
  for(var v of body.taggings_attributes){
    await Tag.findOne({text:v.text},function(e,data){
      if(data){
        curPost.tags.push(new Tag({_id:data._id}))
      }else{
        let TagEntry = new Tag({text:v.text})
        curPost.tags.push(TagEntry)
        TagEntry.save()
      }
    })
  }
  await curPost.save()
  ctx.body = {success:true}
})

//修改文章发布状态/posts/:id/acceptance
router.patch('/posts/:id/acceptance',function(ctx){
  Post.findOne({_id:ctx.params.id},function(err,data){
    const accepted = !data.accepted;
    data.accepted = accepted
    data.save(function(){
      ctx.body ={
        status:status(accepted,data.published_at),
        accepted:accepted
      }
    })
  })
})

//获取需修改文章信息/posts/:id/edit
router.get('/posts/:id/edit',async(ctx)=>{
  let post = await Post.findById(ctx.params.id)
              .select('title published_at accepted lead_sentence tags items')
              .populate({path:'tags',select: 'text'})
  post.items = transTargetType(post.items)
  const tagSug = await Tag.find({}).select('text')
  post = post.toJSON()
  post["tagSuggestions"]=tagSug.map((v)=>{return v.text})
  ctx.body =post
})

//更新文章
//Todo 标签删除时数据库中的数据没有删除
router.patch('/posts/:id/',async (ctx,next)=>{
  const body = ctx.request.body.post;
  const curPost = await Post.findById({_id:ctx.params.id})
  //更新前情况tag数组
  curPost.tags.length = 0
  for(var v of body.taggings_attributes){
    await Tag.findOne({text:v.text},function(e,data){
      if(data){
        curPost.tags.push(new Tag({_id:data._id}))
      }else{
        let TagEntry = new Tag({text:v.text})
        curPost.tags.push(TagEntry)
        TagEntry.save()
      }
    })
  }
  await curPost.update({
    title:body.title,
    published_at:body.published_at,
    lead_sentence:body.lead_sentence,
    updated_at:moment().format(),
    tags:curPost.tags,
    items:body.items_attributes.map((v)=>{
      return _.omit(v,['is_new','editing'])
    })
  })
  ctx.body ={success:true}
})

function transTargetType(data){
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
function status(accepted,time){
  if(!accepted) return 0;
  if(+time >= +new Date()){
    return 1
  }else{
    return 2
  }
}
export default router.routes();
