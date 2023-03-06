var express = require('express');
var router = express.Router();
var template = require('./template');
const app = express()
var db = require('../db');
var authCheck = require('../lib_login/authCheck.js');
var url = require('url');
var sanitizeHtml = require('sanitize-html');
var Tokens = require("csrf");
const { isNull } = require('url/util');
var tokens = new Tokens();
let start = Date.now(86400000);
const date_now = new Date(start);

router.get('/cart',(req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Email = sanitizeHtml(req.session.email);
        db.query(`select * from Student where Email_Address = ?`,[Email], function(error1,result){
            if(error1) throw error1;
            
            db.query(`select * from Cart AS C left join Instructor_TIME AS IT on C.TIME_ID = IT.TIME_ID left join Instructor_DATE AS ID on C.DATE_ID = ID.DATE_ID left join Course on C.Course_ID = Course.Course_ID left join Student AS S on C.Student_ID = S.Student_ID left join Course_Price AS CP on Course.Subject = CP.Subject left join Instructor_TIME_DATE AS ITD on C.TIME_ID = ITD.TIME_ID and C.DATE_ID = ITD.DATE_ID and C.Course_ID = ITD.Course_ID and C.Teacher_ID = ITD.Teacher_ID where C.Student_ID=?;`,
            [result[0].Student_ID], function(error2, results){
                if(results.length > 0){
                    if(error2) throw error2;
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

router.post('/save_price',(req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Subject = sanitizeHtml(req.body.Subject);
        var Time = sanitizeHtml(req.body.Time);
        var Day = sanitizeHtml(req.body.Day);
        var email = sanitizeHtml(req.session.email);
        var Instructor_name = sanitizeHtml(req.body.Instructor_name);
        var Count_number = sanitizeHtml(req.body.Count);
        var count=0;
        db.query(`select Course_ID from Course where Subject = ?;
                select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
                select DATE_ID from Instructor_DATE where Available_DATE =?;
                select Student_ID from Student where Email_Address = ?;
                select Price from Course_Price where Subject = ?;
                `,[Subject, Time, Day, email, Subject],function(error1,result)
                {
                    if(error1) throw error1;
                    db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
                    [Instructor_name,result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID],function(error2,ITD_result){
                        if(error2) throw(error2);
                        db.query(`select * from Cart where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                        [result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[3][count].Student_ID, ITD_result[0].Teacher_ID],function(error3,results){
                            if(error3) throw error3;
                                db.query(`update Cart set Payment_Price = ? where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;`,
                                [((Count_number * result[4][count].Price) - results[0].Use_Point),results[0].Student_ID,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID],
                                function(error4,insert){
                                    if(error4) throw error4;
                                })
                        })
                    })   
                })
            }

})
router.post('/cart_payment',(req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var count=0;
        var Count_number = sanitizeHtml(req.body.Count);
        var Imp_Uid = sanitizeHtml(req.body.Imp_Uid);
        var Merchant_Uid = sanitizeHtml(req.body.Merchant_Uid);
        var Subject = sanitizeHtml(req.body.Subject);
        var Time = sanitizeHtml(req.body.Time);
        var Day = sanitizeHtml(req.body.Day);
        var email = sanitizeHtml(req.session.email);
        var Instructor_name = sanitizeHtml(req.body.Instructor_name);
        var Count_number = sanitizeHtml(req.body.Count);
	var point;
        db.query(`select Course_ID from Course where Subject = ?;
                select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
                select DATE_ID from Instructor_DATE where Available_DATE =?;
                select Student_ID from Student where Email_Address = ?;
                `,[Subject, Time, Day, email],function(error1,result)
                {
                    if(error1) throw error1;
                    db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
                    [Instructor_name,result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID],function(error2,ITD_result){
                        if(error2) throw(error2);
                        db.query(`select * from Cart where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                        [result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[3][count].Student_ID, ITD_result[0].Teacher_ID],function(error3,results){
                            if(error3) throw error3;
			    if(results[0].Use_Point===null) point = 0;
                            else point = results[0].Use_Point;
                            const authNum = Math.random().toString().substr(2,6);
                            db.query(`insert into Section (Teacher_ID, Student_ID, Course_ID, DATE_ID, TIME_ID, Increase_Count, Decrease_Count, Max_Count, Review_Count, Course_Code) values(?,?,?,?,?,?,?,?,?,?);
                                    delete from Cart where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;
                                    update Student set Point = Point - ? where Student_ID = ?;
                                    insert into Payment (imp_uid, merchant_uid, Student_ID, Teacher_ID, DATE_ID, TIME_ID, Course_ID, Payment_Time, Count, Discount_price, Final_price) values(?,?,?,?,?,?,?,?,?,?,?);
                                    update Instructor_TIME_DATE set Course_Active = ? where Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;
                                    `,
                            [results[0].Teacher_ID, results[0].Student_ID, results[0].Course_ID, results[0].DATE_ID, results[0].TIME_ID, 0, Count_number, Count_number, 1, authNum,
                            results[0].Student_ID,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID,
                            point, results[0].Student_ID,
                            Imp_Uid, Merchant_Uid, results[0].Student_ID, results[0].Teacher_ID, results[0].DATE_ID, results[0].TIME_ID, results[0].Course_ID, date_now, Count_number, point, results[0].Payment_Price,
                            1,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID,],
                            function(error4,insert){
                                if(error4) throw error4;
                            })
                        })
                    })   
                })
            }
})
router.post('/insert_point', (req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Subject = sanitizeHtml(req.body.Subject);
        var Time = sanitizeHtml(req.body.Time);
        var Day = sanitizeHtml(req.body.Day);
        var email = sanitizeHtml(req.session.email);
        var Instructor_name = sanitizeHtml(req.body.Instructor_name);
        var Point =  sanitizeHtml(req.body.Point)
        var count=0;
        db.query(`select Course_ID from Course where Subject = ?;
                select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
                select DATE_ID from Instructor_DATE where Available_DATE =?;
                select Student_ID from Student where Email_Address = ?;
                `,[Subject, Time, Day, email],function(error1,result)
                {
                    if(error1) throw error1;
                    db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
                    [Instructor_name, result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID],function(error2,ITD_result){
                        if(error2) throw(error2);
                        db.query(`select * from Cart where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                        [result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[3][count].Student_ID, ITD_result[0].Teacher_ID],function(error3,results){
                            if(error3) throw error3;
                                db.query(`update Cart set Use_Point = ? where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;`,
                                [Point,results[0].Student_ID,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID],
                                function(error4,insert){
                                    if(error4) throw error4;                   
                                })
                        })
                    })   
                })
            }
})

router.post('/delete_cart',(req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Subject = sanitizeHtml(req.body.Subject);
        var Time = sanitizeHtml(req.body.Time);
        var Day = sanitizeHtml(req.body.Day);
        var email = sanitizeHtml(req.session.email);
        var Instructor_name = sanitizeHtml(req.body.Instructor_name);
        var count=0;
        db.query(`select Course_ID from Course where Subject = ?;
        select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
        select DATE_ID from Instructor_DATE where Available_DATE =?;
        select Student_ID from Student where Email_Address = ?;
        `,[Subject, Time, Day, email],function(error1,result)
        {
        if(error1) throw error1;
        db.query(`select Teacher_ID, Course_Active from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
        [Instructor_name,result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID],function(error2,ITD_result){
            if(error2) throw(error2);
            if(ITD_result[0].Course_Active == 1){
                db.query(`delete from Cart where Student_ID = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,[result[3][count].Student_ID,result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID],function(error3,delete_result){
                    if(error3) throw error3;
                    db.query(`select * from Cart where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                    [result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[3][count].Student_ID, ITD_result[0].Teacher_ID],function(error4,results){
                        if(error4) throw error4;
                        db.query(`update Cart set Use_Point = ?, payment_Price = ? where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;`,
                        [0,0, result[3][count].Student_ID, ITD_result[0].Teacher_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[0][count].Course_ID],
                        function(error5,insert){
                            if(error5) throw error5;
                        })
                    })
                })
            }else{
                db.query(`select * from Cart where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                [result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[3][count].Student_ID, ITD_result[0].Teacher_ID],function(error4,results){
                    if(error4) throw error4;
                    db.query(`update Cart set Use_Point = ?, payment_Price = ? where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;`,
                    [0,0, result[3][count].Student_ID, ITD_result[0].Teacher_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[0][count].Course_ID],
                    function(error5,insert){
                        if(error5) throw error5;
                    })
                })
            }
        })   
    })
    }   
})
router.post('/get_result_price_point',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Subject = sanitizeHtml(req.body.Subject);
        var Time = sanitizeHtml(req.body.Time);
        var Day = sanitizeHtml(req.body.Day);
        var email = sanitizeHtml(req.session.email);
        var Instructor_name = sanitizeHtml(req.body.Instructor_name);
        var count=0;
        db.query(`select Course_ID from Course where Subject = ?;
        select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
        select DATE_ID from Instructor_DATE where Available_DATE =?;
        select * from Student where Email_Address = ?;
        `,[Subject, Time, Day, email],function(error1,result)
        {
        if(error1) throw error1;
        db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
        [Instructor_name,result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID],function(error2,ITD_result){
            if(error2) throw(error2);
            db.query(`select * from Cart where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
            [result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[3][count].Student_ID, ITD_result[0].Teacher_ID],function(error3,results){
                if(error3) throw error3;
                res.send({ result : results,
                            name : req.session.nickname,
                            email_address : req.session.email,
                            point : result[3][count].Point,
                            phone_number : result[3][count].Phone_Number,
                            address : result[3][count].Address,
                            postcode : result[3][count].PostCode,
                })
            })
        })   
    })
    }   
})
router.get('/sub_result', (req, res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
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

                        db.query(`select * from Instructor left join (select * from Instructor_TIME_DATE where Course_Active = 0) AS Temp  on Instructor.Teacher_ID = Temp.Teacher_ID left join Instructor_DATE AS ID on ID.Date_ID = Temp.Date_ID left join Instructor_TIME AS IT on IT.TIME_ID = Temp.TIME_ID  left join Course AS C on Temp.Course_ID = C.Course_ID 
                        Where Temp.Course_ID = ? and Temp.TIME_ID = ? and Temp.Date_ID = ?;`,[Number(req.query.Course_type[a]),Number(req.query.Course_time[c]), Number(req.query.Course_day[b])],
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

router.get('/:TeacherId/:CourseId/:DateId/:TIMEId', (req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var email = sanitizeHtml(req.session.email);
        db.query(
            "SELECT * FROM Instructor WHERE Email_Address = ? ",
            [email],
            function (error1, Instructor) {
            if (error1) {
                throw error1;
            }
            if (Instructor !== undefined && Instructor.length > 0) {
                //선생일경우
                res.send(`<script type="text/javascript">alert("강사는 해당 페이지를 접근할 수 없습니다."); 
                            document.location.href="/";</script>`);    
            } else {
                var Course_Id = sanitizeHtml(req.params.CourseId);
                var Date_Id = sanitizeHtml(req.params.DateId);
                var Time_Id = sanitizeHtml(req.params.TIMEId);
                var Teacher_Id = sanitizeHtml(req.params.TeacherId);
                db.query(
                    `
                    select C.Subject, price from Course AS C left join Course_Price AS CP on C.subject = CP.subject where C.Course_ID = ?; 
                    select * from Student where Email_Address = ?; 
                    select * from Instructor_TIME_DATE left join Instructor on Instructor_TIME_DATE.Teacher_ID = Instructor.Teacher_ID where Instructor_TIME_DATE.Teacher_ID = ? and Course_ID = ? and DATE_ID = ? and TIME_ID = ?;
                    `,[Course_Id, email, Teacher_Id, Course_Id, Date_Id, Time_Id],
                    (error2, result) => {
                    if(error2) throw error2;
                        res.render('enroll_page_payment',
                        {
                            authCheck : authCheck.statusUI(req, res),
                            Image : result[2][0].Image,
			    Description : result[2][0].Description,
                            School : result[2][0].School,
                            Price : result[0][0].price,
                            Point : result[1][0].Point,
                            Course_Active : result[2][0].Course_Active,
                            Student_ID : result[1][0].Student_ID,
                            Teacher_name : result[2][0].Name,
                            Course_ID : result[2][0].Course_ID,
                            Date_ID : result[2][0].DATE_ID,
                            Time_ID : result[2][0].TIME_ID,
                            Teacher_ID : result[2][0].Teacher_ID,
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
    }
})

router.get('/:TeacherId/:CourseId/:DateId/:TIMEId/payment', (req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Student = sanitizeHtml(req.session.email);
        var Course_Id = sanitizeHtml(req.params.CourseId);
        var Date_Id = sanitizeHtml(req.params.DateId);
        var Time_Id = sanitizeHtml(req.params.TIMEId);
        var Teacher_Id = sanitizeHtml(req.params.TeacherId);
        db.query(
            `
            select C.Subject, price from Course AS C left join Course_Price AS CP on C.subject = CP.subject where C.Course_ID = ?; 
            select * from Student where Email_Address = ?; 
            select * from Instructor_TIME_DATE where Teacher_ID = ? and Course_ID = ? and DATE_ID = ? and TIME_ID;
            `,[Course_Id, Student, Teacher_Id, Course_Id, Date_Id, Time_Id],
            (error, result) => {
            if(error) throw error;
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
//---------------------------------------------

 router.post('/enroll_save_price',(req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Course_ID =  sanitizeHtml(req.body.Course_ID)
        var Time_ID =  sanitizeHtml(req.body.Time_ID)
        var Date_ID =  sanitizeHtml(req.body.Date_ID)
        var Student_ID =  sanitizeHtml(req.body.Student_ID)
        var Teacher_ID =  sanitizeHtml(req.body.Teacher_ID)
        var Count =  sanitizeHtml(req.body.Count)
        var Price =  sanitizeHtml(req.body.Price)
        db.query(`select * from Enroll_Payment_Savement where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
        [Course_ID,Time_ID, Date_ID, Student_ID, Teacher_ID],function(error3,results){
            if(error3) throw error3;
            db.query(`update Enroll_Payment_Savement set Payment_Price = ?, Count = ? where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
            [((Count * Price) - results[0].Use_Point),Count, Course_ID, Time_ID, Date_ID, Student_ID, Teacher_ID],
            function(error1,insert){
                if(error1) throw error1;
                })
            })
        }
})
router.post('/enroll_normal_payment',(req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Course_ID =  sanitizeHtml(req.body.Course_ID)
        var Time_ID =  sanitizeHtml(req.body.Time_ID)
        var Date_ID =  sanitizeHtml(req.body.Date_ID)
        var Student_ID =  sanitizeHtml(req.body.Student_ID)
        var Teacher_ID =  sanitizeHtml(req.body.Teacher_ID)
        var Count =  sanitizeHtml(req.body.Count)
        var Imp_Uid =  sanitizeHtml(req.body.Imp_Uid)
        var Merchant_Uid =  sanitizeHtml(req.body.Merchant_Uid)
        db.query(`select * from Enroll_Payment_Savement where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
        [Course_ID,Time_ID, Date_ID, Student_ID, Teacher_ID],function(error1,results){
            var point;
            if(error1) throw error1;
            if(isNull(results[0].Use_Point)) point = 0;
            else point = results[0].Use_Point;
            const authNum = Math.random().toString().substr(2,6);
            db.query(`insert into Section (Teacher_ID, Student_ID, Course_ID, DATE_ID, TIME_ID, Increase_Count, Decrease_Count, Max_Count, Review_Count, Course_Code) values(?,?,?,?,?,?,?,?,?,?);
                        delete from Enroll_Payment_Savement where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;
                        update Student set Point = Point - ? where Student_ID = ?;
                        insert into Payment (imp_uid, merchant_uid, Student_ID, Teacher_ID, DATE_ID, TIME_ID, Course_ID, Payment_Time, Count, Discount_price, Final_price) values(?,?,?,?,?,?,?,?,?,?,?);
                        update Instructor_TIME_DATE set Course_Active = ? where Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;
                        `,
            [results[0].Teacher_ID, results[0].Student_ID, results[0].Course_ID, results[0].DATE_ID, results[0].TIME_ID, 0, Count, Count, 1, authNum,
            results[0].Student_ID,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID,
            point, results[0].Student_ID,
            Imp_Uid, Merchant_Uid, results[0].Student_ID, results[0].Teacher_ID, results[0].DATE_ID, results[0].TIME_ID, results[0].Course_ID, date_now, Count, point, results[0].Payment_Price,
            1,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID],
            function(error4,insert){
                if(error4) throw error4;
            })
        })        
    }   
})
//모바일 결제 부분
router.get('/cart_enroll_normal_payment_mobile',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var email = sanitizeHtml(req.session.email);
        var queryData = url.parse(req.url, true).query;
        var Subject =  sanitizeHtml(queryData.Subject)
        var Time =  sanitizeHtml(queryData.Time)
        var Day =  sanitizeHtml(queryData.Day)
        var Instructor_name =  sanitizeHtml(queryData.Instructor_name)
        var Count_number =  sanitizeHtml(queryData.Count)
	var count = 0;
        var Imp_Uid =  sanitizeHtml(queryData.imp_uid)
        var Merchant_Uid =  sanitizeHtml(queryData.merchant_uid)
        var Imp_Success =  sanitizeHtml(queryData.imp_success)
	var point
	    console.log(Subject, Time, Day, Instructor_name)
        if(Imp_Success=="true"){
		db.query(`select Course_ID from Course where Subject = ?;
                select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
                select DATE_ID from Instructor_DATE where Available_DATE =?;
                select Student_ID from Student where Email_Address = ?;
                `,[Subject, Time, Day, email],function(error1,result)
                { 
                    if(error1) throw error1;
			console.log(result)
                    db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
                    [Instructor_name,result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID],function(error2,ITD_result){
                        if(error2) throw(error2);
                        db.query(`select * from Cart where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                        [result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[3][count].Student_ID, ITD_result[0].Teacher_ID],function(error3,results){
                            if(error3) throw error3;
			    if(results[0].Use_Point===null) point = 0;
                            else point = results[0].Use_Point;
                            const authNum = Math.random().toString().substr(2,6);
                            db.query(`insert into Section (Teacher_ID, Student_ID, Course_ID, DATE_ID, TIME_ID, Increase_Count, Decrease_Count, Max_Count, Review_Count, Course_Code) values(?,?,?,?,?,?,?,?,?,?);
                                    delete from Cart where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;
                                    update Student set Point = Point - ? where Student_ID = ?;
                                    insert into Payment (imp_uid, merchant_uid, Student_ID, Teacher_ID, DATE_ID, TIME_ID, Course_ID, Payment_Time, Count, Discount_price, Final_price) values(?,?,?,?,?,?,?,?,?,?,?);
                                    update Instructor_TIME_DATE set Course_Active = ? where Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;
                                    `,
                            [results[0].Teacher_ID, results[0].Student_ID, results[0].Course_ID, results[0].DATE_ID, results[0].TIME_ID, 0, Count_number, Count_number, 1, authNum,
                            results[0].Student_ID,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID,
                            point, results[0].Student_ID,
                            Imp_Uid, Merchant_Uid, results[0].Student_ID, results[0].Teacher_ID, results[0].DATE_ID, results[0].TIME_ID, results[0].Course_ID, date_now, Count_number, point, results[0].Payment_Price,
                            1,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID,],
                            function(error4,insert){
                                if(error4) throw error4;
                           })
                       })
                   })
               })
        }else{
            res.send(`<script type="text/javascript">alert("결제에 실패 했습니다.");
            window.location.href = "/enroll/cart";</script>`);
        }
    }
})

router.get('/enroll_normal_payment_mobile',(req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var queryData = url.parse(req.url, true).query;
        var Course_ID =  sanitizeHtml(queryData.Course_ID)
        var Time_ID =  sanitizeHtml(queryData.Time_ID)
        var Date_ID =  sanitizeHtml(queryData.Date_ID)
        var Student_ID =  sanitizeHtml(queryData.Student_ID)
        var Teacher_ID =  sanitizeHtml(queryData.Teacher_ID)
        var Count =  sanitizeHtml(queryData.Count)
        var Imp_Uid =  sanitizeHtml(queryData.imp_uid)
        var Merchant_Uid =  sanitizeHtml(queryData.merchant_uid)
        var Imp_Success =  sanitizeHtml(queryData.imp_success)
        if(Imp_Success=="true"){
            db.query(`select * from Enroll_Payment_Savement where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
            [Course_ID,Time_ID, Date_ID, Student_ID, Teacher_ID],function(error1,results){
		    console.log(results)
                var point;
                if(error1) throw error1;
                if(isNull(results[0].Use_Point)) point = 0;
                else point = results[0].Use_Point;
                const authNum = Math.random().toString().substr(2,6);
                db.query(`insert into Section (Teacher_ID, Student_ID, Course_ID, DATE_ID, TIME_ID, Increase_Count, Decrease_Count, Max_Count, Review_Count, Course_Code) values(?,?,?,?,?,?,?,?,?,?);
                            delete from Enroll_Payment_Savement where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;
                            update Student set Point = Point - ? where Student_ID = ?;
                            insert into Payment (imp_uid, merchant_uid, Student_ID, Teacher_ID, DATE_ID, TIME_ID, Course_ID, Payment_Time, Count, Discount_price, Final_price) values(?,?,?,?,?,?,?,?,?,?,?);
                            update Instructor_TIME_DATE set Course_Active = ? where Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;
                            `,
                [results[0].Teacher_ID, results[0].Student_ID, results[0].Course_ID, results[0].DATE_ID, results[0].TIME_ID, 0, Count, Count, 1, authNum,
                results[0].Student_ID,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID,
                point, results[0].Student_ID,
                Imp_Uid, Merchant_Uid, results[0].Student_ID, results[0].Teacher_ID, results[0].DATE_ID, results[0].TIME_ID, results[0].Course_ID, date_now, Count, point, results[0].Payment_Price,
                1,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID],
                function(error4,insert){
                    if(error4) throw error4;
		     res.send(`<script type="text/javascript">alert("수강 신청이 완료되었습니다.");
                     window.location.href = "/myinfo";</script>`);
                })
            })
        }else{
            res.send(`<script type="text/javascript">alert("결제에 실패 했습니다.");
                     window.location.href = "/enroll/sub";</script>`);

        }
    }
})

router.get('/add_enroll_normal_payment_mobile',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var queryData = url.parse(req.url, true).query;
        var Course_ID =  sanitizeHtml(queryData.Subject)
        var Time_ID =  sanitizeHtml(queryData.Time)
        var Date_ID =  sanitizeHtml(queryData.Date)
        var Teacher_ID =  sanitizeHtml(queryData.Teacher_Name)
        var Count =  sanitizeHtml(queryData.Count)
        var imp_uid =  sanitizeHtml(queryData.imp_uid)
        var merchant_uid =  sanitizeHtml(queryData.merchant_uid)
        var Imp_Success =  sanitizeHtml(queryData.imp_success)
        var Price =  sanitizeHtml(req.body.Price)
        if(Imp_Success == "true"){
            db.query(`select Course_ID, Price from Course left join Course_Price on Course.Subject = Course_Price.Subject where Course.Subject = ?;
                    select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
                    select DATE_ID from Instructor_DATE where Available_Date = ?;
                    select Student_ID from Student where Email_Address = ? and Phone_Number = ?`,
            [Course_ID,Time_ID,Date_ID, sanitizeHtml(req.session.email), sanitizeHtml(req.session.mobile)],function(error1,result){
                if(error1) throw error1;
                db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and Time_ID = ? and Date_ID =  ?;`,
                [Teacher_ID,result[0][0].Course_ID,result[1][0].TIME_ID,result[2][0].DATE_ID],(error2,Teacher_result)=>{
                    if(error2) throw error2;
                    db.query(`update Section set Max_Count = Max_Count + ?, Decrease_Count = Decrease_Count + ? where Teacher_ID =? and Course_ID =? and Time_ID = ? and Date_ID =? and Student_ID =?;
                            insert into Payment (imp_uid, merchant_uid, Student_ID, Teacher_ID, DATE_ID, TIME_ID, Course_ID, Payment_Time, Count, Discount_price, Final_price) values(?,?,?,?,?,?,?,?,?,?,?);`,
                    [Count,Count,Teacher_result[0].Teacher_ID,result[0][0].Course_ID, result[1][0].TIME_ID, result[2][0].DATE_ID, result[3][0].Student_ID,
                    imp_uid, merchant_uid, result[3][0].Student_ID, Teacher_result[0].Teacher_ID, result[2][0].DATE_ID, result[1][0].TIME_ID, result[0][0].Course_ID, date_now, Count, 0, Price],(error3, results)=>{
                        if(error3) throw error3;
                        res.send(`<script type="text/javascript">alert("수강 신청이 완료되었습니다.");
                        window.location.href = "/myinfo";</script>`);
                    })
                })
            })
        }else{
            res.send(`<script type="text/javascript">alert("결제에 실패 했습니다.");
                     window.location.href = "/myinfo";</script>`);
        }
    }
})
router.post('/enroll_insert_point', (req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Course_ID =  sanitizeHtml(req.body.Course_ID)
        var Time_ID =  sanitizeHtml(req.body.Time_ID)
        var Date_ID =  sanitizeHtml(req.body.Date_ID)
        var Student_ID =  sanitizeHtml(req.body.Student_ID)
        var Teacher_ID =  sanitizeHtml(req.body.Teacher_ID)
        var Point =  sanitizeHtml(req.body.Point)
        db.query(`select * from Enroll_Payment_Savement where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
        [Course_ID,Time_ID, Date_ID, Student_ID, Teacher_ID],function(error3,results){
            if(error3) throw error3;
                db.query(`update Enroll_Payment_Savement set Use_Point = ? where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                [Point,Course_ID,Time_ID, Date_ID, Student_ID, Teacher_ID],
                function(error4,insert){
                    if(error4) throw error4;                         
                })
            })         
        }
})

router.post('/enroll_delete_payment',(req,res) => {
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Course_ID =  sanitizeHtml(req.body.Course_ID)
        var Time_ID =  sanitizeHtml(req.body.Time_ID)
        var Date_ID =  sanitizeHtml(req.body.Date_ID)
        var Student_ID =  sanitizeHtml(req.body.Student_ID)
        var Teacher_ID =  sanitizeHtml(req.body.Teacher_ID)
        db.query(`select * from Enroll_Payment_Savement where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
        [Course_ID,Time_ID, Date_ID, Student_ID, Teacher_ID],function(error1,result){
            if(error1) throw error1;
            if(result.length <= 0){
                db.query(`insert into Enroll_Payment_Savement(Course_ID, TIME_ID, DATE_ID, Student_ID, Teacher_ID, Count) value (?,?,?,?,?,?);`,
                [Course_ID,Time_ID, Date_ID, Student_ID, Teacher_ID,1],
                function(error2,insert){
                    if(error2) throw error2;
                })
            }else{
                db.query(`update Enroll_Payment_Savement set Use_Point = ?, Payment_Price = ? where Student_ID =? and Teacher_ID =? and TIME_ID =? and DATE_ID = ? and Course_ID =?;`,
                [0,0, Student_ID, Teacher_ID, Time_ID, Date_ID, Course_ID],
                function(error2,insert){
                    if(error2) throw error2;
                })
            }
        })
    }
})
router.post('/enroll_get_result_price_point',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Course_ID =  sanitizeHtml(req.body.Course_ID)
        var Time_ID =  sanitizeHtml(req.body.Time_ID)
        var Date_ID =  sanitizeHtml(req.body.Date_ID)
        var Student_ID =  sanitizeHtml(req.body.Student_ID)
        var Teacher_ID =  sanitizeHtml(req.body.Teacher_ID)
        db.query(`select * from Student AS S left join Enroll_Payment_Savement AS E on S.Student_ID = E.Student_ID left join Course AS C on E.Course_ID = C.Course_ID where Email_Address = ? and Phone_Number = ? and E.Course_ID =? and TIME_ID = ? and DATE_ID = ? and  E.Student_ID =? and Teacher_ID = ?;`,
        [req.session.email,req.session.mobile, Course_ID, Time_ID, Date_ID, Student_ID, Teacher_ID],function(error1,results){
            if(error1) throw error1;
        res.send({ result : results,})
        })
    }
})
router.post('/add_payment_Enroll_info',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Course_ID =  sanitizeHtml(req.body.Course_ID)
        var Time_ID =  sanitizeHtml(req.body.Time_ID)
        var Date_ID =  sanitizeHtml(req.body.Date_ID)
        var Teacher_ID =  sanitizeHtml(req.body.Teacher_ID)
        var Count =  sanitizeHtml(req.body.count)
        var imp_uid =  sanitizeHtml(req.body.imp_uid)
        var merchant_uid =  sanitizeHtml(req.body.merchant_uid)
        var Price =  sanitizeHtml(req.body.price)
        db.query(`select Course_ID, Price from Course left join Course_Price on Course.Subject = Course_Price.Subject where Course.Subject = ?;
                select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
                select DATE_ID from Instructor_DATE where Available_Date = ?;
                select Student_ID from Student where Email_Address = ? and Phone_Number = ?`,
        [Course_ID,Time_ID,Date_ID, sanitizeHtml(req.session.email), sanitizeHtml(req.session.mobile)],function(error1,result){
            if(error1) throw error1;
            db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and Time_ID = ? and Date_ID =  ?;`,
            [Teacher_ID,result[0][0].Course_ID,result[1][0].TIME_ID,result[2][0].DATE_ID],(error2,Teacher_result)=>{
                if(error2) throw error2;
                db.query(`update Section set Max_Count = Max_Count + ?, Decrease_Count = Decrease_Count + ? where Teacher_ID =? and Course_ID =? and Time_ID = ? and Date_ID =? and Student_ID =?;
                          insert into Payment (imp_uid, merchant_uid, Student_ID, Teacher_ID, DATE_ID, TIME_ID, Course_ID, Payment_Time, Count, Discount_price, Final_price) values(?,?,?,?,?,?,?,?,?,?,?);`,
                [Count,Count,Teacher_result[0].Teacher_ID,result[0][0].Course_ID, result[1][0].TIME_ID, result[2][0].DATE_ID, result[3][0].Student_ID,
                imp_uid, merchant_uid, result[3][0].Student_ID, Teacher_result[0].Teacher_ID, result[2][0].DATE_ID, result[1][0].TIME_ID, result[0][0].Course_ID, date_now, Count, 0, Price],(error3, results)=>{
                    if(error3) throw error3;
                })
            })
        })
    }
})
router.post('/add_payment_get_result_price_point',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Course_ID =  sanitizeHtml(req.body.Course_ID)
        var Count =  sanitizeHtml(req.body.count)
        db.query(`select Course_ID, Price from Course left join Course_Price on Course.Subject = Course_Price.Subject where Course.Subject = ?;
                  select * from Student where Email_Address = ? and Phone_Number = ?`,
        [Course_ID, sanitizeHtml(req.session.email), sanitizeHtml(req.session.mobile)],function(error1,results){
            if(error1) throw error1;
                res.send({ 
                result : results,
                Price : results[0][0].Price * Count
            })
        })
    }
})

router.post('/add_isrefund',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Course_ID =  sanitizeHtml(req.body.Course_ID)
        var Time_ID =  sanitizeHtml(req.body.Time_ID)
        var Date_ID =  sanitizeHtml(req.body.Date_ID)
        var Teacher_ID =  sanitizeHtml(req.body.Teacher_ID)
        db.query(`select Course_ID from Course where Subject = ?;
                select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
                select DATE_ID from Instructor_DATE where Available_Date = ?;
                select Student_ID from Student where Email_Address = ? and Phone_Number = ?`,
        [Course_ID,Time_ID,Date_ID, sanitizeHtml(req.session.email), sanitizeHtml(req.session.mobile)],function(error1,result){
            if(error1) throw error1;
            db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and Time_ID = ? and Date_ID =  ?;`,
            [Teacher_ID,result[0][0].Course_ID,result[1][0].TIME_ID,result[2][0].DATE_ID],(error2,Teacher_result)=>{
                if(error2) throw error2;
                db.query(`select * from refund_payment where Student_ID = ? and Teacher_ID = ? and TIME_ID =? and DATE_ID = ? and Course_ID =?`,
                [result[3][0].Student_ID, Teacher_result[0].Teacher_ID, result[1][0].TIME_ID, result[2][0].DATE_ID, result[0][0].Course_ID],(error3, results)=>{
                    if(error3) throw error3;
                    if(results.length > 0){
                        res.send({result : 'Y'})
                    }
                    else res.send({result : 'N'})
                })
            })
        })
    }
})


//--------------cart담기
router.post('/enroll_move_cart',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Course_ID =  sanitizeHtml(req.body.Course_ID)
        var Time_ID =  sanitizeHtml(req.body.Time_ID)
        var Date_ID =  sanitizeHtml(req.body.Date_ID)
        var Student_ID =  sanitizeHtml(req.body.Student_ID)
        var Teacher_ID =  sanitizeHtml(req.body.Teacher_ID)
        var Count =  sanitizeHtml(req.body.Count)
        db.query(`
        select * from Cart where Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ? and Student_ID = ?;
        `,
        [Teacher_ID,Time_ID,Date_ID,Course_ID,Student_ID],function(error1,result){
            if(error1) throw error1;
            if(result.length > 0) {
                return res.send({result : "fail"})
            }else{
                db.query(`select count(*) AS C from Cart where Student_ID = ?`,[Student_ID],function(error1,Count_number){
                    if(error1) throw error1;
                    if(Count_number[0].C >= 5){
                        return res.send({result : "overflow"})
                    }else{
                        db.query(`
                        insert into Cart(Teacher_ID,TIME_ID,DATE_ID,Course_ID,Student_ID,Count,Use_Point, Payment_Price) values(?,?,?,?,?,?,?,?);
                        `,
                        [Teacher_ID,Time_ID,Date_ID,Course_ID,Student_ID,Count,0,0],function(error2,results){
                            if(error2) throw error2;
                            return res.send({result : "success"})
                        })
                    }
                })
            }
        })  
    }
})

router.post('/enroll_cart_delete',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Subject = sanitizeHtml(req.body.Subject);
        var Time = sanitizeHtml(req.body.Time);
        var Day = sanitizeHtml(req.body.Day);
        var email = sanitizeHtml(req.session.email);
        var Instructor_name = sanitizeHtml(req.body.Instructor_name);
        var count=0;
        db.query(`select Course_ID from Course where Subject = ?;
                select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
                select DATE_ID from Instructor_DATE where Available_DATE =?;
                select Student_ID from Student where Email_Address = ?;
                `,[Subject, Time, Day, email],function(error1,result)
                {
                    if(error1) throw error1;
                    db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
                    [Instructor_name,result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID],function(error2,ITD_result){
                        if(error2) throw(error2);
                        db.query(`select * from Cart where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                        [result[0][count].Course_ID, result[1][count].TIME_ID,result[2][count].DATE_ID,result[3][count].Student_ID, ITD_result[0].Teacher_ID],function(error3,results){
                            if(error3) throw error3;
                                db.query(`delete from Cart where Student_ID =? and Teacher_ID = ? and TIME_ID = ? and DATE_ID = ? and Course_ID = ?;`,
                                [results[0].Student_ID,results[0].Teacher_ID, results[0].TIME_ID,results[0].DATE_ID,results[0].Course_ID],
                                function(error4,insert){
                                    if(error4) throw error4;
                                })
                        })
                    })   
                })
    }
})
router.post('/enroll_cart_all_delete',(req,res)=>{
    req.session.secret = tokens.secretSync();
    if(req.session.is_logined!=true){ //세션만료
        return res.redirect("/auth/login");
    }
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var email = sanitizeHtml(req.session.email);
        var phone = sanitizeHtml(req.session.mobile)
        db.query(`select Student_ID from Student where Email_Address = ? and Phone_Number`,[email,phone],(error1,result) => {
            if(error1) throw error1;
            db.query(`delete from Cart where Student_ID = ?`,[result[0].Student_ID])
        })
    }
})


 module.exports = router;
