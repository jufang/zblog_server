'use strict';

import Router from 'koa-router';
import { createPagination, transTargetType, status } from '../helper';
import Post from '../../models/post';
import Tag from '../../models/tag';
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
  async ctx =>{
    ctx.body = ctx.data;
  }
)
//创建文件初始化form
router.get('/posts/new',async (ctx,next)=>{
  const tagSug = await Tag.find({}).select('text')
  ctx.body = {
    title:null,
    accepted :false,
    tags:[],
    id:null,
    items:[],
    leadSentence:null,
    publishedAt:null,
    tagSuggestions:tagSug.map((v)=>{return v.text})
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
router.patch('/posts/:id/acceptance',async (ctx)=>{
  const data = await Post.findOne({_id:ctx.params.id})
  if(data){
    const accepted = !data.accepted;
    data.accepted = accepted
    await data.save()
    ctx.body ={
      status:status(accepted,data.published_at),
      accepted:accepted
    }
  }
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

export default router.routes();
