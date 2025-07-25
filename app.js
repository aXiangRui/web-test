const express = require("express")
const mysql = require("mysql")
const util = require("./util")
const {db} = require("./db")
const user = require("./manage/user")
const task = require("./manage/task")
const session = require("express-session")

const app = express()

app.use(session({
  secret: "your_secret_key", // 用于加密session的密钥（自定义）
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000 // session有效期（1天）
  }
}));
app.use(express.urlencoded({ extended: false }))
app.use('/static',express.static(__dirname+'/static'));

app.get('/',(req,res)=>{
    if(req.session.userName == null)
    {
    util.read('pages/login.html')
    .then(resp=>{
        res.write(resp)
        res.end()
    })
    }
    else{
    util.read('pages/main.html')
    .then(resp=>{
        res.write(resp)
        res.end()
    })        
    }
})
app.get('/user',async(req,res)=>{   
    if(res.session.userName == null){
    const data = await util.read('pages/login.html')
    res.end(data);
    } 
    else{
        res.redirect('/')
    }
})

app.get('/signup',async(req,res)=>{
    const data = await util.read('pages/signup.html')
    res.end(data);
})

app.post('/gettask',async(req,res)=>{
    const id = await user.getUserID(req.session.userName);
    console.log("f**king js",id)
})

app.post('/newLogin',async(req,res)=>{
    const{userName,userPwd,address} = req.body;
        if(!userName || !userPwd || !address){
        return res.send("请输入名称或密码后重新注册")
    }
    try{
        const userInfo = await user.addUser(userName,userPwd,address);
        if(userInfo){
            res.redirect('/user');
        }
        else{
            //alert("用户名或密码错误，请重试")
        }
    }
    catch(err){
        res.send(err.message);
    }

    if(!userName || !userPwd){
        return res.send("请输入名称或密码后重新登录")
    }
    try{
        const userInfo = await user.checkUser(userName,userPwd);
        if(userInfo){
            res.redirect('/');
        }
        else{
            //alert("用户名或密码错误，请重试")
        }
    }
    catch(err){
        res.send(err.message);
    }
})

app.post('/login',async(req,res)=>{
    const{userName,userPwd} = req.body;
    if(!userName || !userPwd ){
        return res.send("请输入名称或密码后重新登录")
    }
    try{
        const userInfo = await user.checkUser(userName,userPwd);
        if(userInfo){
            req.session.userName = userInfo.userName
            const newID = await user.getUserID(req.session.userName)
            req.session.userID = newID
            console.log("(QAQ)",req.session.userName)
            console.log("(QwQ)",req.session.userID)
            console.log("(QoQ)",newID)
            res.redirect('/');
        }
        else{
            res.write("用户名或密码错误，请重试")
        }
    }
    catch(err){
        res.send(err.message);
    }

    if(!userName || !userPwd){
        return res.send("请输入名称或密码后重新登录")
    }
    try{
        const userInfo = await user.checkUser(userName,userPwd);
        if(userInfo){
            res.redirect('/');
        }
        else{
            //alert("用户名或密码错误，请重试")
        }
    }
    catch(err){
        //res.send(err.message);
    }
})

app.get('/userTasks', async (req, res) => {
    try {
        // 从Session获取当前登录用户ID（之前登录逻辑中已存储）
        const userId = req.session.userID;
        console.log("req......",req.session.userID)
        console.log("userid---------",userId)
        // 校验：如果未登录，返回错误提示
        if (!userId) {
            return res.json({ 
                success: false, 
                message: "请先登录" 
            });
        }

        // 调用getBlog获取该用户的任务数据
        const taskData = await task.getBlog(userId);
        // 返回数据给前端（成功/失败两种情况）
        if (taskData) {
            res.json({
                success: true,
                data: taskData || []// 这里就是getBlog返回的字段数据
            });
        } else {
            res.json({
                success: false,
                message: "暂无任务数据"
            });
        }
    } catch (err) {
        // 错误处理（比如数据库查询失败）
        res.json({
            success: false,
            message: "获取数据失败：" + err.message
        });
    }
});

// app.js 中添加
app.get('/taskList', (req, res) => {
    // 读取上面创建的taskList.html并返回给浏览器
    util.read('pages/main.html') // 假设html文件在pages目录下
        .then(html => {
            res.end(html);
        })
        .catch(err => {
            res.send('页面加载失败：' + err.message);
        });
});
//----------------业务处理-----------------

app.get('/GetUserbyAddress', async (req,res)=>{
    const use = await user.getUserByAddres('3323463190@qq.com')
    console.log(user)
})

app.get('/getuser',(req,res)=>{
    const sql = "select * from user";
    db(sql,null)
    .then(resp=>{
        res.send(resp)
    })
})

app.get('/addUser',(req,res)=>{
    sqlParams = sqlParams || []
    const sql = "insert into user set ?"
    const sqlParams = {userName:"222",userPwd:"222"}
    db(sql,sqlParams)
    .then(resp=>{
        res.send(resp)
    })
})

app.post('/addtask',async(req,res)=>{
        const{date,starttime,endtime,note} = req.body;
    if(!date || !starttime || !endtime || !note ){
        return res.send("请填写完整")
    }
    try{
        const newid = await user.getUserID(req.session.userName)
        const taskInfo = await task.addtask(newid,starttime,endtime,date,note);       
        res.redirect('/')
        if(taskInfo){
            console.log("你他妈不会卡在这了吧")
            res.redirect('/')
            console.log("这不能返回是啥毛病")
            return
        }
        else{
            res.write("请重试")
        }
    }
    catch(err){
        res.send(err.message);
    }
})
app.post('/deltask',async(req,res)=>{
    const{TaskID}=req.body
    const taskInfo = await task.delete(TaskID);
    res.redirect('/')
})

app.listen(3000,()=>{
    console.log("server is listening 3000");
})