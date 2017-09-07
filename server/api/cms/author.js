'use strict';

import Router from 'koa-router';
import Author from '../../models/author';
const crypto    = require('crypto');
const router = new Router({
    prefix: '/cms/api/v1'
});

//登录与注册
router.post('/authors/sign-in',async (ctx,next)=>{
  const authorD = ctx.request.body.author;
  const authorE = await Author.findOne({'email':authorD.email})
  if(authorE){
    validatePassword(authorD.password,authorE.encrypted_password,function(err,isValidatePass){
      if (isValidatePass){
        ctx.body = {"accessToken":authorE.access_token}
      }	else{
        ctx.status = 401
        ctx.body = {"errorMessage": "您的用户名或者密码错误" }
      }
    })
  }else{
    ctx.status = 401
    ctx.body = {"errorMessage": "您的用户名或者密码错误" }
  }
})
router.post('/authors/sign-up',async (ctx,next)=>{
  const authorD = ctx.request.body.author;
  const authorN = await Author.findOne({'name':authorD.name})
  if(authorN){
    ctx.status = 422
    ctx.body = {"errorMessage": "用户已存在" }
  }else{
    const authorE = await Author.findOne({'email':authorD.email})
    if(authorE){
      ctx.status = 422
      ctx.body = {"errorMessage": "邮箱已存在" }
    }else{
      const data = await Author.create({
        name:authorD.name,
        email:authorD.email,
        encrypted_password:saltAndHash(authorD.password),
        access_token:generateSalt()
      });
      if(data._id){
        ctx.body = {"accessToken":data.access_token}
      }
    }
  }
})
router.delete('/authors/sign-out',function(ctx){
  ctx.body = {success:true}
})
//关于作者
router.get('/authors/edit',async (ctx,next)=>{
  const data = await Author.findOne({access_token:ctx.request.get("Authorization")},'name description introduction image')
  if(data){
    ctx.body = data
  }
})
router.patch('/authors/',async (ctx,next)=>{
  const authorD = ctx.request.body.author;
  const data = await Author.findOneAndUpdate(
    {access_token:ctx.request.get("Authorization")},
    { $set: authorD },
    {new: true}
  )
  if(data){
    ctx.body = {success:true}
  }
})
var generateSalt = function(){
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}
var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass){
	var salt = generateSalt();
	return salt + md5(pass + salt);
}

var validatePassword = function(plainPass, hashedPass, callback){
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

export default router.routes();
