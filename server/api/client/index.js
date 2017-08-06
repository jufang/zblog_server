'use strict';

import Router from 'koa-router';
import Author from '../../models/author';
import Post from '../../models/post';
import Tag from '../../models/tag';
import { createClientPagination, transTargetType, status } from '../helper';
const router = new Router();

//关于作者
router.get('/about',async (ctx,next)=>{
  const data = await Author.findOne({access_token:'DMN1QhOfwS'},'name description introduction image')
  if(data){
    ctx.body = data
  }
})
router.get('/home',async (ctx,next)=>{
  const author = await Author.findOne({})
  const post = await Post.find({accepted:true,published_at:{'$lt':+new Date()}}).sort({_id:-1}).limit(3).select('title lead_sentence')
  ctx.body = {
    introduction:author.introduction,
    latestPosts:post
  }
})
router.get('/posts', async (ctx,next)=>{
    const tag_id = ctx.query['tag-id']
    const conditions = {}
    if(tag_id){
      conditions.tags = tag_id
    }
    ctx.conditions = conditions
    await next();
  },
  createClientPagination(Post, { limit: 20 }),
  async ctx =>{
    ctx.body = ctx.data;
  }
)
router.get('/posts/:id',async (ctx,next)=>{
  const id = ctx.params.id
  let post = await Post.findById({_id:id})
              .select('title published_at tags items')
              .populate({path:'tags',select: 'text'})
  const prevPost = await Post.findOne({_id:{'$lt':id}}).sort({_id:-1}).limit(1)
  const nextPost = await Post.findOne({_id:{'$gt':id}}).sort({_id:1}).limit(1)
  post.items = transTargetType(post.items)
  post = post.toJSON()
  if(prevPost){
    post.prevId = prevPost._id
    post.prevTitle = prevPost.title
  }else{
    post.prevId = null
    post.prevTitle = null
  }
  if(nextPost){
    post.nextId = nextPost._id
    post.nextTitle = nextPost.title
  }else{
    post.nextId = null
    post.nextTitle = null
  }
  ctx.body= post
})


export default router.routes();
