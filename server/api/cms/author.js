'use strict';

import Router from 'koa-router';
import Author from '../..//models/author';
const crypto    = require('crypto');


const router = new Router({
    prefix: '/cms/api/v1'
});

//登录与注册
router.post('/authors/sign-in',function(ctx,next){
  const authorD = ctx.request.body.author;
  Author.findOne({'email':authorD.email},function(e,o){
    if(o==null){
      ctx.body = {"errorMessage": "您的用户名或者密码错误" }
    }else{
      validatePassword(authorD.password,o.encrypted_password,function(err,isValidatePass){
        if (isValidatePass){
          ctx.body = {success:true}
				}	else{
          ctx.body = {"errorMessage": "您的用户名或者密码错误" }
				}
      })
    }
  })
})
router.post('/authors/sign-up',function(ctx,next){
  const authorD = ctx.request.body.author;
  Author.findOne({'name':authorD.name},function(e,o){
    if(o){
      ctx.body = 'ssjsjj'
    }else{
      Author.findOne({'email':authorD.email},function(e1,o1){
        if(o1){
          ctx.body = {"errorMessage": "邮箱已存在" }
        }else{
          const author = new Author({
            name:authorD.name,
            email:authorD.email,
            encrypted_password:saltAndHash(authorD.password),
            access_token:generateSalt()
          })
          author.save(function(err,data){
            if(err){
              ctx.body = {"errorMessage":"创建用户失败"}
            }else{
              ctx.body = {"accessToken":data.access_token}
            }
          })
        }
      })
    }
  })
})
router.delete('/authors/sign-out',function(ctx){
  ctx.body = {success:true}
})
//关于作者
router.get('/authors/edit',async (ctx,next)=>{
  ctx.body = await Author.findOne({access_token:ctx.request.get("Authorization")}).select('name description introduction image');
  // Author.findOne({access_token:ctx.request.get("Authorization")},'name description introduction image ',function(err,data){
  //   console.log(err,data)
  //   if(err){
  //     ctx.body = {"errorMessage":"编辑用户出错"}
  //     ctx.status = 400
  //   }else{
  //     ctx.body = {name:data.name,description:data.description,introduction:data.introduction,image:data.image}
  //   }
  // })
})
router.patch('/authors/',function(ctx,next){
  const authorD = ctx.request.body.author;
  Author.findOneAndUpdate({access_token:ctx.request.get("Authorization")},authorD,{},function(err,data){
    if(data){
      ctx.body = {success:true}
    }
  })
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
