const {db} = require('../db')

const task = {
    addtask:async(userID,starttime,endtime,date,note)=>{
        const sql = "insert into tasks (userID,starttime,endtime,date,note) values (?,?,?,?,?);";
        const result = await db(sql,[userID,starttime,endtime,date,note]);
        return result.length>0?result:null;    
    },

    update:async(arr)=>{    
        const sql = "update tasks set ? where id = ?"
        return await db(sql,arr)
    },

    delete:async(id)=>{
       console.log(id)
       const sql = "update tasks set is_del = 1 where TaskID = ?"
       const result = await db(sql,[id])
       return result.length>0?result:null
    },

    getBlog:async(userID)=>{
        const sql = "select * from tasks where userID = ?;";
        const result = await db(sql,[userID]);
        console.log(result)
        return result.length>0?result:null;
    },
}
module.exports = task;