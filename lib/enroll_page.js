var express = require('express');
var router = express.Router();
var template = require('./template');
const app = express()
var db = require('../db');
var authCheck = require('../lib_login/authCheck.js');
var url = require('url');
var sanitizeHtml = require('sanitize-html');
var Tokens = require("csrf");
var tokens = new Tokens();

router.get('/cart',(req,res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Email = req.session.email;
        db.query(`select * from Student where Email_Address = ?`,[Email], function(error1,result){
            if(error1) throw error1;
            console.log('result',result)
            db.query(`select * from Cart AS C left join Instructor_TIME AS IT on C.TIME_ID = IT.TIME_ID left join Instructor_DATE AS ID on C.DATE_ID = ID.DATE_ID left join Course on C.Course_ID = Course.Course_ID left join Student AS S on C.Student_ID = S.Student_ID left join Course_Price AS CP on Course.Subject = CP.Subject left join Instructor_Time_Date AS ITD on C.TIME_ID = ITD.TIME_ID and C.DATE_ID = ITD.DATE_ID and C.Course_ID = ITD.Course_ID and C.Teacher_ID = ITD.Teacher_ID where C.Student_ID=?;`,
            [result[0].Student_ID], function(error2, results){
                if(results.length > 0){
                    if(error2) throw error2;
                    console.log('resilts',results)
                    var list = template.cart_list(results);
                    res.render('enroll_cart',{
                        authCheck : authCheck.statusUI(req, res),
                        Price : results[0].Price,
                        Point : results[0].Point,
                        Course_Active : results[0].Course_Active,
                        Course_ID : results[0].Course_ID,
                        Date_ID : results[0].DATE_ID,
                        Time_ID : results[0].TIME_ID,
                        Teacher_ID : results[0].Teacher_ID,
                        Subject : results[0].Subject,
                        Name : results[0].Name,
                        Email_Address : result[0].Email_Address,
                        Phone_Number : result[0].Phone_Number,
                        Address : result[0].Address,
                        Count : result[0].Count,
                        List : list,
                    });
                }else{
                    res.send(`<script type="text/javascript">alert("장바구니에 담긴 강의가 없습니다."); 
                    document.location.href="/";</script>`);    
                }}
            )
            
        })
    }
})
router.get('/sub', (req, res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        res.render('enroll_page_before_search',
        {
            authCheck : authCheck.statusUI(req, res)
        });
    }
})

router.get('/sub_result', (req, res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
            res.redirect('/auth/login');
            return false;
        }
        else{
            var dataList=[];
            for(let a=0; a<req.query.Course_type.length; a++){
                for(let b=0; b<req.query.Course_day.length; b++){
                    for(let c=0; c<req.query.Course_time.length; c++){
                        db.query(`select * from Instructor left join (select * from Instructor_Time_Date where Course_Active = 0) AS Temp  on Instructor.Teacher_ID = Temp.Teacher_ID left join Instructor_DATE AS ID on ID.Date_ID = Temp.Date_ID left join Instructor_TIME AS IT on IT.TIME_ID = Temp.TIME_ID  left join Course AS C on Temp.Course_ID = C.Course_ID 
                        Where Temp.Course_ID = ? and Temp.TIME_ID = ? and Temp.Date_ID = ?;`,[Number(req.query.Course_type[a]), Number(req.query.Course_day[b]),Number(req.query.Course_time[c])],
                        function(error2, Instructor){
                            if(error2) throw error2;
                            if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
                                res.redirect('/auth/login');
                                return false;
                            }else {
                                for(var data of Instructor) dataList.push(data);
                            }
                            }	
                        )
                    }
                }
            }
        }
        setTimeout(function(){
        var enroll_list = template.Enroll_list(dataList);
        res.render('enroll_page_after_search',
        {
            authCheck : authCheck.statusUI(req, res),
            Enroll_list : enroll_list
        });
        },200)
    }
})
router.post('/cart_payment',(req,res) => {
    var count=0;
    db.query(`select Course_ID from Course where Subject = ?;
              select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
              select DATE_ID from Instructor_DATE where Available_DATE =?;
              select Student_ID from Student where Email_Address = ?;
              `,[req.body.Subject,req.body.Time,req.body.Day,req.session.email],function(error1,result)
              {
                if(error1) throw error1;
                console.log(result);
                console.log('time',result[2][0])
                db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
                [req.body.Instructor_name,result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID],function(error2,ITD_result){
                    if(error2) throw(error2);
                    console.log('ITD',ITD_result)
                    db.query(`select * from cart where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                    [result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[3][count].Student_ID, ITD_result[0].Teacher_ID],function(error3,results){
                        if(error3) throw error3;
                        console.log('results111',results);
                            const authNum = Math.random().toString().substr(2,6);
                            db.query(`insert into Section (Teacher_ID, Student_ID, Course_ID, DATE_ID, TIME_ID, Increase_Count, Decrease_Count, Max_Count, Review_Count, Course_Code) values(?,?,?,?,?,?,?,?,?,?);
                                      delete from Cart where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ? `,
                            [results[0].Teacher_ID, results[0].Student_ID, results[0].Course_ID, results[0].DATE_ID, results[0].TIME_ID, 0, req.body.Count, req.body.Count, 1, authNum,
                            results[0].Student_ID,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID],
                            function(error4,insert){
                                if(error4) throw error4;
                            })
                        // }
                    })
                })   
            })
})
 router.get('/:TeacherId/:CourseId/:DateId/:TIMEId', (req,res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var post = req.body;
        console.log('post',post);
        var Student = sanitizeHtml(req.session.email);
        var Course_Id = sanitizeHtml(req.params.CourseId);
        var Date_Id = sanitizeHtml(req.params.DateId);
        var Time_Id = sanitizeHtml(req.params.TIMEId);
        var Teacher_Id = sanitizeHtml(req.params.TeacherId);
        db.query(
            `
            select C.Subject, price from Course AS C left join Course_Price AS CP on C.subject = CP.subject where C.Course_ID = ?; 
            select * from Student where Email_Address = ?; 
            select * from Instructor_Time_Date where Teacher_ID = ? and Course_ID = ? and DATE_ID = ? and TIME_ID;
            `,[Course_Id, Student, Teacher_Id, Course_Id, Date_Id, Time_Id],
            (error, result) => {
            if(error) throw error;
                console.log('result',result);
                res.render('enroll_page_payment',
                {
                    authCheck : authCheck.statusUI(req, res),
                    Price : result[0][0].price,
                    Point : result[1][0].Point,
                    Course_Active : result[2][0].Course_Active,
                    Teacher_name : result[2][0].Name,
                    Course_ID : Course_Id,
                    Date_ID : Date_Id,
                    Time_ID : Time_Id,
                    Teacher_ID : Teacher_Id,
                    Subject : result[0][0].Subject,
                    Name : result[1][0].Name,
                    Email_Address : result[1][0].Email_Address,
                    Phone_Number : result[1][0].Phone_Number,
                    Address : result[1][0].Address,
                    Recommand_ID : result[1][0].Recommand_ID,
                });
        })
    }
})

router.get('/:TeacherId/:CourseId/:DateId/:TIMEId/payment', (req,res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var post = req.body;
        console.log('post',post);
        var Student = sanitizeHtml(req.session.email);
        var Course_Id = sanitizeHtml(req.params.CourseId);
        var Date_Id = sanitizeHtml(req.params.DateId);
        var Time_Id = sanitizeHtml(req.params.TIMEId);
        var Teacher_Id = sanitizeHtml(req.params.TeacherId);
        db.query(
            `
            select C.Subject, price from Course AS C left join Course_Price AS CP on C.subject = CP.subject where C.Course_ID = ?; 
            select * from Student where Email_Address = ?; 
            select * from Instructor_Time_Date where Teacher_ID = ? and Course_ID = ? and DATE_ID = ? and TIME_ID;
            `,[Course_Id, Student, Teacher_Id, Course_Id, Date_Id, Time_Id],
            (error, result) => {
            if(error) throw error;
                console.log('result',result);
                res.render('enroll_page_payment_result',
                {
                    authCheck : authCheck.statusUI(req, res),
                    Price : result[0][0].price,
                    Point : result[1][0].Point,
                    Course_Active : result[2][0].Course_Active,
                    Teacher_name : result[2][0].Name,
                    Course_ID : Course_Id,
                    Date_ID : Date_Id,
                    Time_ID : Time_Id,
                    Teacher_ID : Teacher_Id,
                    Subject : result[0][0].Subject,
                    Name : result[1][0].Name,
                    Email_Address : result[1][0].Email_Address,
                    Phone_Number : result[1][0].Phone_Number,
                    Address : result[1][0].Address,
                    Recommand_ID : result[1][0].Recommand_ID,
                });
        })
    }
})

 router.get('/payment/complete/',(req,res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    const authNum = Math.random().toString().substr(2,6);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var queryData = url.parse(req.url, true).query;
        console.log('queryData', queryData);
        db.query(
            `update Student set Point = Point - ? where Email_Address = ?;
            update Instructor_Time_Date set Course_Active = 1 where Teacher_ID = ? and TIME_ID = ? and Date_ID = ? and Course_ID = ? ;
            insert into Section(Student_ID, Teacher_ID, Course_ID, DATE_ID, TIME_ID, Increase_Count, Decrease_Count, Max_Count, Review_Count, Course_Code) values(?,?,?,?,?,?,?,?,?,?);
            insert into Payment(Order_ID, Student_ID, Teacher_ID, DATE_ID, TIME_ID, Course_ID, Original_price, Discount_price, Final_price) value(?,?,?,?,?,?,?,?,?);
            `,[queryData.point,req.session.email
            , queryData.teacher_id, queryData.time_id, queryData.date_id, queryData.course_id
            , req.session.Student_Id, queryData.teacher_id , queryData.course_id, queryData.date_id, queryData.time_id, 0, queryData.count, queryData.count, 1, authNum,
            , queryData.merchant_uid, req.session.Student_Id, queryData.teacher_id, queryData.date_id, queryData.time_id, queryData.course_id, queryData.original_price, queryData.point, queryData.final_price
        ],
        function(error, result){
        if(error) throw error;
        console.log('payment',result);
        res.redirect('/');
        });
    }
 })
 module.exports = router;