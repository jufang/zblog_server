const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


export function connectDatabase(URI) {
    // 连接mongodb数据库
    const db = mongoose.connect(URI).connection;
    
    // 当数据库连接上返回一个promise对象
    return new Promise(function(resolve, reject) {
      db.on('connected', () => !console.log("MongoDB connected!"));
      db.on('open', resolve); 
      db.on('error', reject);
    });
};
