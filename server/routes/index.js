var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment = require("moment");
const { now } = require('moment');
const multiparty = require("multiparty");
const e = require('express');
var connection = mysql.createConnection({
  host     : 'localhost',
  port     :  3306,
  user     : 'root',
  password : '1363071121',
  database : 'rustlings-python'
});
connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Rustlings-Python~当好您Python学习之路的车把手！' });
});
router.get('/timu/index.html',function(req,res,next){
  res.render('index');
})
router.get('/timu/table.html',function(req,res,next){
  res.render('table');
})
router.get('/timu',(req,res,next)=>{
  res.render('timu');
})
router.get('/index',function(req,res,next){
  res.render('index');
})
router.get('/index.html',function(req,res,next){
  res.render('index');
})
router.get('/table.html',function(req,res,next){
  res.render('table');
})
router.post('/dequestion',(req,res,next)=>{
  let name=req.body.name;
  console.log(req.body);
  let sql=`DELETE FROM \`questions\` WHERE question_name='${name}'`;
  connection.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.send('no');
    }else{
      sql=`DELETE FROM \`status\` WHERE question_name='${name}'`;
      connection.query(sql,(err,result)=>{
        if(err){
          console.log(err);
          res.send('no');
        }else{
          res.send('ok');
        }
      })
    }
  })
})
router.post('/fenfa',(req,res,next)=>{
  name=req.body.name;
  let sql=`SELECT timu FROM questions WHERE question_name='${name}'`
  connection.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.send("no");
    }else{
      res.send(result[0]["timu"]);
    }
  })
})
router.post('/sign_up',(req,res,next)=>{
  let user=req.body.user;
  let password=req.body.password;
  let sql = `
  INSERT INTO user SET  ? 
  `
  if(password.length<6){
    res.send("to short");
    return;
  }
  connection.query(sql,{user_id:user,user_password:password},function(err,data){
    if(err){
      console.log(err)
      res.send('fail');
    } else {
//      console.log('插入数据成功');
      res.send('ok');
    }
  })
})
router.post('/deall',(req,res,next)=>{
  let sql=`DELETE FROM \`questions\``;
  connection.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.send("no");
    }else{
      sql=`DELETE FROM \`status\``;
      connection.query(sql,(err,result)=>{
        if(err){
          console.log(err);
          res.send('no');
        }else{
          res.send('ok');
        }
      })
    }
  })
})
router.post('/update',(req,res,next)=>{
  user=req.body.user;
  password=req.body.password;
  question=req.body.question;
  anwser=req.body.anwser;
  sql =`SELECT user_password FROM user
  WHERE user_id = \'${user}\' 
  `
  connection.query(sql,(err,result)=>{
      if(err){
        console.log(err);
        res.send(err);
      }else{
        if(password==result[0].user_password){
          sql=`SELECT question_anwser FROM questions WHERE question_name= \'${question}\'`
          connection.query(sql,(err,quesResult)=>{
            if(err){
              console.log(err);
              res.send(err);
            }else{
              if(quesResult.length==0){
                console.log("None");
                res.send("None");
              }
              if(anwser==quesResult[0].question_anwser){
                sql=`
                INSERT INTO status(user_id,question_name,time,ispass) VALUES (?,?,?,?)
                `
                para=[user,question,moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),1]
                connection.query(sql,para,(err,insert)=>{
                  if(err){
                    res.send(err);
                  }else{
                    res.send("correct!");
                  }
                })
              }else{
                sql=`
                INSERT INTO status(user_id,question_name,time,ispass) VALUES (?,?,?,?)
                `
                para=[user,question,moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),0]
                connection.query(sql,para,(err,insert)=>{
                  if(err){
                    res.send(err);
                    console.log(err);
                  }else{
                    res.send("wrong!");
                  }
                })
              }
            }
          })
        }else{
          res.send("account error!");
        }
      }
  })
})
router.post('/list',(req,res,next)=>{
  sql="SELECT question_name FROM questions ORDER BY question_serise ASC"
  connection.query(sql,(err,result)=>{
    if(err){
      res.sendStatus(404)
      console.error(err);
    }else{
//      console.log(result)
      res.send(result);
    }
  })
})
router.post('/ti',(req,res,next)=>{
  name=req.body.name;
  sql=`SELECT timu FROM questions WHERE questions.question_name=\'${name}\'`;
  connection.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.sendStatus(404);
    }else{
//      console.log(result);
      res.send(result[0]["timu"]);
    }
  })
})
router.post('/queryuser',(req,res,next)=>{
  user=req.body.user;
  sql=`SELECT * FROM status WHERE status.user_id=\'${user}\'`;
  connection.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.sendStatus(404);
    }else{
      console.log(result);
      res.send(result);
    }
  })
})

router.get("/basestatus",async (req,res,next)=>{
  sql=`SELECT count(*) FROM user`
  usernum=await (()=>{
    return new Promise((resolve,reject)=>{
      connection.query(sql,(err,result)=>{
        if(err){
          res.sendStatus(404);
          console.log(err);
          reject(err);
        }else{
          resolve(result[0]["count(*)"]);
        }
      })
    })
  })();
  sql=`SELECT count(*) FROM questions`
  querynum=await(()=>{
    return new Promise((resolve,reject)=>{
      connection.query(sql,(err,result)=>{
        if(err){
          res.sendStatus(404);
          console.log(err);
          reject(err);
        }else{
          resolve(result[0]["count(*)"]);
        }
      })
    })
  })();
  sql=`SELECT count(*) FROM status`
  tijiaonum=await(()=>{
    return new Promise((resolve,reject)=>{
      connection.query(sql,(err,result)=>{
        if(err){
          res.sendStatus(404);
          console.log(err);
          reject(err);
        }else{
          resolve(result[0]["count(*)"]);
        }
      })
    })
  })();
  sql=`SELECT count(*) FROM status WHERE status.ispass=1`;
  correctrate=await(()=>{
    return new Promise((resolve,reject)=>{
      connection.query(sql,(err,result)=>{
        if(err){
          res.sendStatus(404);
          console.log(err);
          reject(err);
        }else{
          resolve(result[0]["count(*)"]);
        }
      })
    })
  })()/tijiaonum;
  data={"usernum":usernum,"querynum":querynum,"tijiaonum":tijiaonum,"correctrate":correctrate};
//  console.log(data);
  res.send(data);
})
router.get('/alldata',(req,res,next)=>{
  sql=`SELECT * FROM status`;
  connection.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.sendStatus(404);
    }else{
      res.send(result)
    }
  })
})


router.get('/paihang',async (req,res,next)=>{
  qingkuang=await(()=>{
    return new Promise((resolve,reject)=>{
      let sql=`SELECT question_name,user_id FROM status WHERE ispass=1`;
      connection.query(sql,(err,result)=>{
        if(err){
          console.log(err);
          res.sendStatus(404);
          reject(err);
        }else{
          resolve(result);
        }
      })
    })
  })()
//  console.log(qingkuang);
  renyuan=await(()=>{
    return new Promise((resolve,reject)=>{
      sql=`SELECT user_id FROM user`;
      connection.query(sql,(err,result)=>{
        if(err){
          console.log(err);
          res.sendStatus(404);
          reject(err);
        }else{
          resolve(result);
        }
      })
    })
  })()
  timu=await(()=>{
    return new Promise((resolve,reject)=>{
      sql=`SELECT question_name FROM questions`;
      connection.query(sql,(err,result)=>{
        if(err){
          console.log(err);
          res.sendStatus(404);
          reject(err);
        }else{
          resolve(result);
        }
      })
    })
  })()
  // console.log(timu);
  duibi=[]
  for(i=0;i<renyuan.length;i++){
    now_renyuan=renyuan[i]["user_id"];
    count=0;
    for(j=0;j<timu.length;j++){
      now_timu=timu[j]["question_name"];
      for(k=0;k<qingkuang.length;k++){
        if(qingkuang[k]["user_id"]==now_renyuan && qingkuang[k]["question_name"]==now_timu){
//          console.log(qingkuang[k])
          count++;
          break;
        }
      }
    }
    duibi.push({"now_renyuan":now_renyuan,"count":count});
  }
//  console.log(duibi);
  duibi.sort((a,b)=>{
    return a.count-b.count;
  })
  // console.log(duibi);
  // console.log(qingkuang);
  // console.log(renyuan);
  // console.log(timu);
  res.send(duibi);
})

router.get('/nan',async(req,res,next)=>{
  qingkuang=await(()=>{
    return new Promise((resolve,reject)=>{
      sql=`SELECT question_name,ispass FROM status`;
      connection.query(sql,(err,result)=>{
        if(err){
          console.log(err);
          res.sendStatus(404);
          reject(err);
        }else{
          resolve(result);
        }
      })
    })
  })()
  list=[]
  dic={}
  for(i=0;i<qingkuang.length;i++){
    now_question=qingkuang[i]["question_name"];
    if(dic[now_question]==undefined){
      dic[now_question]={};
      dic[now_question]["correct"]=0;
      dic[now_question]["uncorrect"]=0;
    }
    if(qingkuang[i]["ispass"]){
      dic[now_question]["correct"]+=1;
    }else{
      dic[now_question]["uncorrect"]+=1;
    }
  }
  // console.log(dic);
  for (key in dic){
    list.push({question:key,rate:dic[key]["correct"]/(dic[key]["correct"]+dic[key]["uncorrect"])});
  }
  list.sort((a,b)=>{
      return a.rate-b.rate;
  })
  res.send(list);
})
router.get('/firstblood',async (req,res,next)=>{
  qingkuang=await(()=>{
    return new Promise((resolve,reject)=>{
      sql=`SELECT question_name,user_id,time FROM \`status\` WHERE \`status\`.ispass=1`;
      connection.query(sql,(err,result)=>{
        if(err){
          console.log(err);
          res.sendStatus(404);
          reject(err);
        }else{
          resolve(result);
        }
      })
    })
  })()
  dic={};
  for(i=0;i<qingkuang.length;i++){
    now_question=qingkuang[i]["question_name"];
    // console.log(qingkuang[i]["time"]);
    //console.log(now_question);
    if(dic[now_question]==undefined){ 
      dic[now_question]={};
      dic[now_question]["earliest"]=Date.parse(new Date(qingkuang[i]["time"]));
      dic[now_question]["info"]=qingkuang[i];
    }else{
      if(Date.parse(new Date(qingkuang[i]["time"]))<dic[now_question]["earliest"]){
        dic[now_question]["earliest"]=Date.parse(new Date(qingkuang[i]["time"]));
        dic[now_question]["info"]=qingkuang[i];
      }
    }
//     console.log(dic[now_question]["earliest"])
  }
//  console.log(dic);
  list=[]
  for(key in dic){
    list.push(dic[key]["info"]);
  }
  res.send(list);
})
router.get("/nao",(req,res,next)=>{
  sql=`SELECT user_id,question_name,count(*)
  from \`status\`
  GROUP BY \`status\`.question_name,\`status\`.user_id
  HAVING COUNT(*)>5`
  connection.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.sendStatus(404);
    }else{
      res.send(result);
    }
  })
})
router.delete("/dropuser",(req,res,next)=>{
  userid=req.body.user;
  password=req.body.password;
  sql =`SELECT user_id,user_password FROM user
  WHERE user_id = \'${userid}\' 
  `;
  connection.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.sendStatus(500);
    }else{
      if(result.length==0){
        res.send("noneuser");
        return;
      }else{
        if(result[0]["user_password"]==password){
          sql=`DELETE FROM \`user\` WHERE user_id='${userid}'`
          connection.query(sql,(err,result)=>{
            if(err){
              console.log(err);
              res.sendStatus(500);
            }else{
              sql=`DELETE FROM \`status\` WHERE user_id='${userid}'`;
              connection.query(sql,(err,result)=>{
                if(err){
                  console.log(err);
                  res.sendStatus(500);
                }else{
                  res.send("ok");
                }
              })
            }
          })
        }else{
          res.send("wrongpassword");
        }
      }
    }
  })
})
router.post('/addquestion',async(req,res,next)=>{
  timu=req.body.timu;
  anwser=req.body.anwser;
  name=req.body.name;
//  console.log(req.body)
  sql=`SELECT COUNT(*) FROM questions WHERE question_name='${name}'`;
  exist=await(()=>{
    return new Promise((resolve,reject)=>{
      connection.query(sql,(err,result)=>{
        if(err){
          console.log(err);
          res.send('no');
          resolve(true);
        }else{
//          console.log(result);
          if(result[0]["COUNT(*)"]==0){
            resolve(false);
          }else{
            resolve(true);
          }
        }
      })
    })
  })()
  if(exist){
    sql=`UPDATE questions SET timu = '${timu}', question_anwser = '${anwser}' WHERE question_name='${name}'`;
    console.log(sql);
    connection.query(sql,(err,result)=>{
      if(err){
        console.log(err);
        res.send('no');
      }else{
        res.send("ok");
      }
    })
  }else{
//    console.log("cwwwww");
    num=await(()=>{
      return new Promise((resolve,reject)=>{
        sql=`SELECT MAX(question_serise) FROM questions`; 
        connection.query(sql,(err,result)=>{
          if(err){
            console.log(err);
            res.sendStatus(500);
            reject(err);
          }else{
            resolve(result[0]["MAX(question_serise)"]);
          }
        })
      })
    })()+1
  //  console.log(num);
    sql=`INSERT INTO questions SET  ?`
    connection.query(sql,{question_name:name,question_anwser:anwser,timu:timu,question_serise:num},(err,result)=>{
      if(err){
        console.log(err);
      }else{
        res.send("ok");
      }
    })
  }
})

module.exports = router;
