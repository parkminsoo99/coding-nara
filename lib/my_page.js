var express = require("express");
var router = express.Router();
var authCheck = require("../lib_login/authCheck.js");
var db = require("../db");
var sanitizeHtml = require("sanitize-html");
var Tokens = require("csrf");
var tokens = new Tokens();
var template = require("./template");


router.get("/", function (request, response) {
  console.log(request.session);

  console.log(request.session.is_logined);
  if(request.session.is_logined!=true){
    return response.redirect("/auth/login");
  }

  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Student`, function (error, Reviews) {
      var email = request.session.email;
      console.log(email);
      db.query(
        "SELECT * FROM Instructor WHERE Email_Address = ? ",
        [email],
        function (error2, Instructor) {
          if (error2) {
            throw error2;
          }
          console.log(Instructor);
          console.log(Instructor === undefined);
          if (Instructor !== undefined && Instructor.length > 0) {
            //선생일경우
            return response.redirect("/myinfo/instructor");
          } else {
            db.query(`SELECT * FROM Student`, function (error, Reviews) {
              var email = request.session.email;
              console.log(email);
              db.query('SELECT * FROM Student WHERE Email_Address = ? ',[email], function(error2, result){
                db.query(`select * from Section as S left join Instructor_Time_Date as ITD on S.Course_ID = ITD.Course_ID and S.TIME_ID = ITD.TIME_ID and S.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = S.Teacher_ID left join Course as C on S.Course_ID = C.Course_ID left join Instructor_TIME as IT on S.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on S.DATE_ID = ID.DATE_ID where Student_ID = ?;
                          select * from Payment as P left join Instructor_Time_Date as ITD on P.Course_ID = ITD.Course_ID and P.TIME_ID = ITD.TIME_ID and P.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = P.Teacher_ID left join Course as C on P.Course_ID = C.Course_ID left join Instructor_TIME as IT on P.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on P.DATE_ID = ID.DATE_ID where Student_ID = ?;
                `,
                [result[0].Student_ID,result[0].Student_ID],(error2, results) => {
                  if(error2) throw error2;
                  console.log('results',results[0])
                  var lecture_list = template.lecture_list(results[0]);
                  var payment_list = template.payment_list(results[1]);
                  response.render('my_page_root',
                  {
                    Title : '강의 리스트',
                    authCheck : authCheck.statusUI(request, response),
                    Lecture_List : lecture_list,
                    Payment_List : payment_list,
                    Name : result[0].Name,
                    Password : result[0].Password,
                    Phone_Number : result[0].Phone_Number,
                    Address : result[0].Address,
                    Email_Address : result[0].Email_Address,
                    Point : result[0].Point
                  })
                })
              }) 
            })
          }
        }
      );
    });
  }
});

router.get('/user_information_change', (request, response) => {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    response.render('user_information_change');
  }
})

router.post('/validate_Mypage_Email', (request,response) => {
  console.log(request)
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    var username = sanitizeHtml(request.body.username)
    var Email_Address = sanitizeHtml(request.body.EA)
    console.log(username, Email_Address)
    if(request.body.hideCK) {
      console.log('true')
      db.query(`select * from Student where Name = ? and Email_Address = ?`,[username, Email_Address], (error1, result)=>{
        if(error1) throw error1;
        if(result.length > 0){
          request.session.email_mypage_check = 1;
          response.send(`<script type="text/javascript">alert("이메일 인증완료"); 
          document.location.href="/myinfo";</script>`);
        }
        else{
            response.send(`<script type="text/javascript">alert("계정이 존재하지 않습니다."); 
            document.location.href="/myinfo/user_information_change";</script>`);
        }})
    }else{
      console.log('2222')
      response.send(`<script type="text/javascript">alert("이메일 인증을 해주세요."); 
          document.location.href="/myinfo/user_information_change";</script>`);
      
    }
  }
})
router.post('/button_change_validation',(request,response) => {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    if(request.session.email_mypage_check === 1){
      response.send({result : 1})
    }else{
      response.send({result : 2})
    }
  }
})
router.get('/update', function (request,response){
      db.query(
        "SELECT * FROM Instructor WHERE Email_Address = ? ",
        [email],
        function (error2, Instructor) {
          if (error2) {
            throw error2;
          }
          console.log(Instructor);
          console.log(Instructor === undefined);
          if (Instructor !== undefined && Instructor.length > 0) {
            //선생일경우
            return response.redirect("/myinfo/instructor");
          } else {
            db.query(
              "SELECT * FROM Student WHERE Email_Address = ? ",
              [email],
              function (error2, result) {
                db.query(
                  `select * from Section as S left join Instructor_Time_Date as ITD on S.Course_ID = ITD.Course_ID and S.TIME_ID = ITD.TIME_ID and S.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = S.Teacher_ID left join Course as C on S.Course_ID = C.Course_ID left join Instructor_TIME as IT on S.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on S.DATE_ID = ID.DATE_ID where Student_ID = ?;`,
                  [result[0].Student_ID],
                  (error2, results) => {
                    if (error2) throw error2;
                    console.log("results", results);
                    var list = template.lecture_list(results);
                    response.render("my_page_root", {
                      Title: "강의 리스트",
                      authCheck: authCheck.statusUI(request, response),
                      List: list,
                      Name: result[0].Name,
                      Password: result[0].Password,
                      Phone_Number: result[0].Phone_Number,
                      Address: result[0].Address,
                      Email_Address: result[0].Email_Address,
                      Point: result[0].Point,
                    });
                  }
                );
              }
            );
          }
        }
      );
    });
router.get("/lecture/history", function (request, response) {
  request.session.secret = tokens.secretSync();
  if(request.session.is_logined!=true){ //세션만료
    return response.redirect("/auth/login");
  }
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Student WHERE Student.Email_Address = ?;`,
      [email],
      function (error, Reviews) {
        console.log(Reviews);
        db.query(
          "SELECT * FROM lecture_History left join Instructor_TIME on lecture_History.TIME_ID = Instructor_TIME.TIME_ID left join Instructor_DATE on lecture_History.DATE_ID = Instructor_DATE.DATE_ID left join Course on lecture_History.Course_ID = Course.Course_ID left join Instructor on lecture_History.Teacher_ID = Instructor.Teacher_ID  WHERE lecture_History.Student_ID = ?;",
          [Reviews[0].Student_ID],
          function (error2, history) {
            console.log(history);
            if (error2) throw error2;
            var list = template.lecture_list_history(history);
                response.render("my_page_lecture_history", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  // Name: result[0].Name,
                  // Password: result[0].Password,
                  // Phone_Number: result[0].Phone_Number,
                  // Address: result[0].Address,
                  // Email_Address: result[0].Email_Address,
                  // Point: result[0].Point,
                });
          }
        );
      }
    );
  }
});

router.get('/refund_page/',(request,response) => {
  console.log(request)
  var queryData = url.parse(request.url, true).query;
  var subject = sanitizeHtml(queryData.Subject)
  var time = sanitizeHtml(queryData.Time)
  var day = sanitizeHtml(queryData.Day)
  var teacher = sanitizeHtml(queryData.Teacher)
  db.query(`select Course_ID from Course where Subject = ?;
            select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
            select DATE_ID from Instructor_DATE where Available_DATE =?;
            select Student_ID from Student where Email_Address = ?;
            `,[subject,time,day,request.session.email],function(error1,result)
            {
              if(error1) throw error1;
              console.log('result',result);
              db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
              [teacher,result[0][0].Course_ID, result[1][0].TIME_ID,result[2][0].DATE_ID],function(error2,ITD_result){
                  if(error2) throw(error2);
                  console.log('ITD',ITD_result)
                  db.query(`select * from refund_payment where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                  [result[0][0].Course_ID, result[1][0].TIME_ID,result[2][0].DATE_ID,result[3][0].Student_ID, ITD_result[0].Teacher_ID],function(error3,back_result){
                    if(error3) throw error3;
                    if(back_result.length > 0){
                      response.send(`<script type="text/javascript">alert("이미 환불신청이 완료된 강좌입니다."); 
                        document.location.href="/myinfo";</script>`);
                    }else{
                      db.query(`select * from Section where Course_ID =? and TIME_ID = ? and DATE_ID = ? and  Student_ID =? and Teacher_ID = ?;`,
                      [result[0][0].Course_ID, result[1][0].TIME_ID,result[2][0].DATE_ID,result[3][0].Student_ID, ITD_result[0].Teacher_ID],function(error4,results){
                      if(error4) throw error4;
                      console.log('results111113',results);
                      if(results.length > 0){
                        response.render('refund_page',{
                          authCheck : authCheck.statusUI(request, response),
                          Subject : subject,
                          Time : time,
                          Day : day,
                          Teacher : teacher,
                        });
                      }else{
                        response.send(`<script type="text/javascript">alert("해당 강좌는 수강이 끝난 강좌이거나 이미 환불이 완료된 강좌입니다."); 
                        document.location.href="/myinfo";</script>`);
                      }
                    })
                  }
                })
              })   
            })
})
  
router.post('/refund_db',(request,response) => {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{ 
    var subject = sanitizeHtml(request.body.course);
    var time = sanitizeHtml(request.body.time);
    var day = sanitizeHtml(request.body.day);
    var teacher = sanitizeHtml(request.body.teacher);
    var reason = sanitizeHtml(request.body.reason);
    console.log('sub',subject, time, day, teacher, reason)
    db.query(`select Course_ID from Course where Subject = ?;
            select TIME_ID from Instructor_TIME where Available_Start_Time = ?;
            select DATE_ID from Instructor_DATE where Available_DATE =?;
            select Student_ID from Student where Email_Address = ?;
            `,[subject,time,day,request.session.email],function(error1,result)
            {
              if(error1) throw error1;
              console.log(result)
              db.query(`select Teacher_ID from Instructor_TIME_DATE where Name = ? and Course_ID = ? and TIME_ID = ? and DATE_ID = ?;`,
              [teacher,result[0][0].Course_ID, result[1][0].TIME_ID,result[2][0].DATE_ID],function(error2,ITD_result){
                if(error2) throw(error2);
                console.log(ITD_result)
                db.query(`select imp_uid from Payment where Teacher_ID =? and Student_ID =? and DATE_ID =? and TIME_ID =? and Course_ID = ?;
                          select Decrease_Count, Max_Count from Section where Teacher_ID =? and Student_ID =? and DATE_ID =? and TIME_ID =? and Course_ID = ?;
                `,
                [ITD_result[0].Teacher_ID,result[3][0].Student_ID,result[2][0].DATE_ID,result[1][0].TIME_ID,result[0][0].Course_ID,
                 ITD_result[0].Teacher_ID,result[3][0].Student_ID,result[2][0].DATE_ID,result[1][0].TIME_ID,result[0][0].Course_ID
                ],function(error3,results){
                  if(error3) throw error3;
                  console.log(results)
                  db.query(`insert into refund_payment(imp_uid, reason, cancel_request_amount, Max_Count, Student_ID, Teacher_ID, TIME_ID, DATE_ID, Course_ID) value(?,?,?,?,?,?,?,?,?)`,
                  [results[0][0].imp_uid, reason, results[1][0].Decrease_Count, results[1][0].Max_Count, result[3][0].Student_ID, ITD_result[0].Teacher_ID,result[1][0].TIME_ID,result[2][0].DATE_ID,result[0][0].Course_ID],function(error4,result){
                    if(error4) throw error4;
                    response.send(`<script type="text/javascript">alert("환불 신청이 완료되었습니다.(카드사 환불까지 7일 정도 소요 예정)"); 
                        document.location.href="/myinfo";</script>`);
                  })
                })
              })
            })
          }
        })
router.post('/update_mypage', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    var Name = sanitizeHtml(request.body.username);
    var Phone_Number = sanitizeHtml(request.body.number);
    var Address_post = sanitizeHtml(request.body.member_post);
    var Address_addr = sanitizeHtml(request.body.member_addr);
    var Address_leftover = sanitizeHtml(request.body.member_leftover);
    var Address = Address_addr +' '+ Address_leftover;
    if (Name && Phone_Number && Address_post && Address_addr ) { //필수정보
        db.query(`SELECT * FROM Student WHERE Email_Address = ? or Phone_Number =?;
        `, [request.session.email,request.session.mobile], function(error1, results) { // DB에 같은 이름의 회원아이디가 있는지 확인
            if (error1) throw error1;
            console.log('results',results);
            if (results.length > 0) {     // DB에 같은 이름의 회원아이디가 있는지 확인
              db.query(`update Student set Name = ?, Address = ?, Phone_Number =?`,[Name,Address,Phone_Number],(error2,result)=>{
                if(error2) throw error2;
                response.send(`<script type="text/javascript">alert("회원 정보가 변경되었습니다."); 
                document.location.href="/myinfo";</script>`);
              })
            }else{
              response.send(`<script type="text/javascript">alert("회원 정보가 변경에 실패했습니다."); 
              document.location.href="/myinfo";</script>`);
            }
        })
      }else {        // 입력되지 않은 정보가 있는 경우
        response.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다."); 
        document.location.href="/myinfo/update";</script>`);
      }
    }
});

router.get('/lecture_list', (request, response) => {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    db.query(`select * from Student where Email_Address = ?;`,
              [request.session.email],(error1,result)=>{
      if(error1) throw error1;
      console.log('result',result)
      db.query(`select * from Section as S left join Instructor_Time_Date as ITD on S.Course_ID = ITD.Course_ID and S.TIME_ID = ITD.TIME_ID and S.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = S.Teacher_ID left join Course as C on S.Course_ID = C.Course_ID left join Instructor_TIME as IT on S.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on S.DATE_ID = ID.DATE_ID where Student_ID = ?;`,
      [result[0].Student_ID],(error2, results) => {
        if(error2) throw error2;
        console.log('results',results)
        var list = template.lecture_list(results);
        response.render('lecture_list',
        {
          Title : '강의 리스트',
          authCheck : authCheck.statusUI(request, response),
          List : list,
        })
      })
    })
  }
})



router.get("/instructor", function (request, response) {
  request.session.secret = tokens.secretSync();
  if(request.session.is_logined!=true){ //세션만료
    return response.redirect("/auth/login");
  }
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Instructor WHERE Instructor.Email_Address = ?;`,
      [email],
      function (error, Reviews) {
        console.log(Reviews);

        db.query(
          "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
          [email],
          function (error2, result) {
            // console.log(result);
            db.query(
              `select * from Section as S left join Instructor_Time_Date as ITD on S.Course_ID = ITD.Course_ID and S.TIME_ID = ITD.TIME_ID and S.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = S.Teacher_ID left join Course as C on S.Course_ID = C.Course_ID left join Instructor_TIME as IT on S.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on S.DATE_ID = ID.DATE_ID left join Student on Student.Student_ID = S.Student_ID WHERE ITD.Course_Active = 1 AND ITD.Teacher_ID = ?;`,
              [Reviews[0].Teacher_ID],
              (error2, results) => {
                if (error2) throw error2;
                console.log("results", results);
                var list = template.lecture_list_instructor(results);
                response.render("my_page_instructor", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  Name: result[0].Name,
                  Password: result[0].Password,
                  Phone_Number: result[0].Phone_Number,
                  Address: result[0].Address,
                  Email_Address: result[0].Email_Address,
                  Point: result[0].Point,
                });
              }
            );
          }
        );
      }
    );
  }
});

router.get("/instructor/lecture/history", function (request, response) {
  request.session.secret = tokens.secretSync();
  if(request.session.is_logined!=true){ //세션만료
    return response.redirect("/auth/login");
  }
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Instructor WHERE Instructor.Email_Address = ?;`,
      [email],
      function (error, Reviews) {
        console.log('Reviews',Reviews);
        db.query(
          "SELECT * FROM lecture_History left join Instructor_TIME on lecture_History.TIME_ID = Instructor_TIME.TIME_ID left join Instructor_DATE on lecture_History.DATE_ID = Instructor_DATE.DATE_ID left join Course on lecture_History.Course_ID = Course.Course_ID left join Instructor on lecture_History.Teacher_ID = Instructor.Teacher_ID left join Student on lecture_History.Student_ID = Student.Student_ID  WHERE lecture_History.Teacher_ID = ?;",
          [Reviews[0].Teacher_ID],
          function (error2, history) {
            console.log('history',history);
            if (error2) throw error2;
            var list = template.lecture_list_history(history);
                response.render("my_page_lecture_history_instructor", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  // Name: result[0].Name,
                  // Password: result[0].Password,
                  // Phone_Number: result[0].Phone_Number,
                  // Address: result[0].Address,
                  // Email_Address: result[0].Email_Address,
                  // Point: result[0].Point,
                });
          }
        );
      }
    );
  }
});

router.get(
  "/instructor/update/:course/:date/:time",
  function (request, response) {
    request.session.secret = tokens.secretSync();
    if(request.session.is_logined!=true){ //세션만료
      return response.redirect("/auth/login");
    }
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error("invalid token!");
    } else {
      db.query(`SELECT * FROM Instructor`, function (error, Reviews) {
        var email = request.session.email;
        console.log(email);

        db.query(
          "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
          [email],
          function (error2, result) {
            // console.log(result);
            db.query(
              `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
              [email],
              (error2, results) => {
                if (error2) throw error2;
                console.log("results", results);
                var list = template.lecture_list_instructor_update(results);
                var course = request.params.course;
                var date = request.params.date;
                var time = request.params.time;
                response.render("my_page_instructor_update_enter", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  Name: result[0].Name,
                  Password: result[0].Password,
                  Phone_Number: result[0].Phone_Number,
                  Address: result[0].Address,
                  Email_Address: result[0].Email_Address,
                  Point: result[0].Point,
                  course: course,
                  date: date,
                  time: time,
                  Teacher_ID: result[0].Teacher_ID,
                });
              }
            );
          }
        );
      });
    }
  }
);

router.post("/instructor/update/delete", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    if (!authCheck.isOwner(request, response)) {
      // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect("/auth/login");
      return false;
    } else {
      var post = request.body;
      console.log("post", post);
      var Student_Id = request.session.Student_Id;
      var Name = request.session.nickname;
      console.log(post.Teacher_ID);
      console.log(Student_Id);
      const id = Number(Student_Id);
      console.log(Student_Id.toString());
      console.log(post.course);
      console.log(post.date);
      console.log(post.time);
      db.query(`select * from Cart WHERE Teacher_ID = ? AND Course_ID = ? AND TIME_ID = ? AND DATE_ID = ?`,[post.Teacher_ID, post.course, post.time, post.date],(error1,cart_result)=>{
        if(error1) throw error1;
        if(cart_result.length>0){
          db.query(`delete from Cart WHERE Teacher_ID = ? AND Course_ID = ? AND TIME_ID = ? AND DATE_ID = ?`,[post.Teacher_ID, post.course, post.time, post.date],(error3,cart_result)=>{
            if(error3) throw error3;
          })
        }
        db.query(
          "DELETE FROM Instructor_Time_Date WHERE Teacher_ID = ? AND Course_ID = ? AND TIME_ID = ? AND DATE_ID = ?",
          [post.Teacher_ID, post.course, post.time, post.date],
          function (error2, result) {
            if (error2) {
              throw error2;
            }
            response.writeHead(302, { Location: `/myinfo/instructor/update` });
            response.end();
          }
        );
      })
    }
  }
})

router.get("/instructor/update", function (request, response) {
  request.session.secret = tokens.secretSync();
  if(request.session.is_logined!=true){ //세션만료
    return response.redirect("/auth/login");
  }
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Instructor WHERE Instructor.Email_Address = ?`,
      [email],
      function (error, Reviews) {
        console.log(email);

        db.query(
          "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
          [email],
          function (error2, result) {
            // console.log(result);
            db.query(
              `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
              [email],
              (error2, results) => {
                if (error2) throw error2;
                // console.log("results", results);
                var list = template.lecture_list_instructor_update(results);
                response.render("my_page_instructor_update", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  Name: result[0].Name,
                  Password: result[0].Password,
                  Phone_Number: result[0].Phone_Number,
                  Address: result[0].Address,
                  Email_Address: result[0].Email_Address,
                  Point: result[0].Point,
                  Teacher_ID: result[0].Teacher_ID,
                });
              }
            );
          }
        );
      }
    );
  }
});

router.get("/instructor/update/create", function (request, response) {
  request.session.secret = tokens.secretSync();
  if(request.session.is_logined!=true){ //세션만료
    return response.redirect("/auth/login");
  }
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Instructor`, function (error, Reviews) {
      var email = request.session.email;
      // console.log(email);

      db.query(
        "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
        [email],
        function (error2, result) {
          // console.log(result);
          db.query(
            `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
            [email],
            (error2, results) => {
              if (error2) throw error2;
              // console.log("results", results);
              var list = template.lecture_list_instructor_update(results);
              response.render("my_page_instructor_update_create", {
                Title: "강의 리스트",
                authCheck: authCheck.statusUI(request, response),
                List: list,
                Name: result[0].Name,
                Teacher_ID: result[0].Teacher_ID,
                Password: result[0].Password,
                Phone_Number: result[0].Phone_Number,
                Address: result[0].Address,
                Email_Address: result[0].Email_Address,
                Point: result[0].Point,
                Nickname: email,
              });
            }
          );
        }
      );
    });
  }
});

router.post("/instructor/update/create_process", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Instructor WHERE Instructor.Email_Address = ?`,
      [email],
      function (error, Reviews) {
        console.log("Reviews", Reviews);
        console.log(Reviews[0].Teacher_ID);
        console.log(Reviews[0].Name);

        db.query(
          "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
          [email],
          function (error2, result) {
            // console.log(result);
            db.query(
              `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
              [email],
              (error2, results) => {
                if (error2) throw error2;
                var post = request.body;
                console.log(post);
                console.log(result[0].Name);
                var dataList = [];
                for (let a = 0; a < post.Course_type.length; a++) {
                  for (let b = 0; b < post.Course_day.length; b++) {
                    for (let c = 0; c < post.Course_time.length; c++) {
                      db.query(
                        `insert into Instructor_Time_Date (Teacher_ID, Name, Course_ID, DATE_ID, TIME_ID, Course_Active) values(?,?,?,?,?,?);`,
                        [
                          Reviews[0].Teacher_ID,
                          Reviews[0].Name,
                          Number(post.Course_type[a]),
                          Number(post.Course_day[b]),
                          Number(post.Course_time[c]),
                          0,
                        ],
                        function (error2, Instructor) {
                          if (error2) throw error2;
                        }
                      );
                    }
                  }
                }
                response.writeHead(302, {
                  Location: `/myinfo/instructor/update`,
                });
                response.end();

                // console.log("results", results);
                // var list = template.lecture_list_instructor_update(results);
                // response.render("my_page_instructor_update_create", {
                //   Title: "강의 리스트",
                //   authCheck: authCheck.statusUI(request, response),
                //   List: list,
                //   Name: result[0].Name,
                //   Teacher_ID: result[0].Teacher_ID,
                //   Password: result[0].Password,
                //   Phone_Number: result[0].Phone_Number,
                //   Address: result[0].Address,
                //   Email_Address: result[0].Email_Address,
                //   Point: result[0].Point,
                //   Nickname : email
                // });
              }
            );
          }
        );
      }
    );
  }
});

router.post("/instructor/increase", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Instructor`, function (error, Reviews) {
      var email = request.session.email;
      // console.log(email);

      db.query(
        "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
        [email],
        function (error2, result) {
          // console.log(result);
          db.query(
            `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
            [email],
            (error2, results) => {
              if (error2) throw error2;
              var post = request.body;
              console.log(post);
              console.log(post.Max);
              console.log(post.Increase);
              if (post.Max > post.Increase) {
                db.query(
                  //강의완료 업데이트
                  `UPDATE Section SET Teacher_ID = ?, Course_ID = ?, DATE_ID = ?, TIME_ID = ? ,Increase_Count = ?, Decrease_Count = ?;
                  insert into lecture_History (Student_ID, Teacher_ID, Complete_time, Course_ID, DATE_ID, TIME_ID) values(?,?,NOW(),?,?,?);`,
                  [
                    post.Teacher_ID,
                    post.course,
                    post.date,
                    post.time,
                    Number(post.Increase) + 1,
                    Number(post.Decrease) - 1,
                    post.Student_ID,
                    Reviews[0].Teacher_ID,
                    post.course,
                    post.date,
                    post.time,
                  ],
                  function (error2, result) {
                  }
                );
              } else if (post.Max === post.Increase) {
                db.query(
                  //강의삭제
                  "DELETE FROM Section WHERE Teacher_ID = ? AND Course_ID = ? AND DATE_ID = ? AND TIME_ID = ?",
                  [post.Teacher_ID, post.course, post.date, post.time],
                  function (error2, result) {
                    if (error2) throw error2;
                    db.query(
                      //강의삭제
                      "UPDATE Instructor_Time_Date SET Course_Active = ?, Teacher_ID = ?, Course_ID = ?, DATE_ID = ?, TIME_ID = ?",
                      [0, post.Teacher_ID, post.course, post.date, post.time],
                      function (error2, result) {}
                    );
                  }
                );
              }

              response.writeHead(302, { Location: `/myinfo/instructor` });
              response.end();

              // console.log("results", results);
              // var list = template.lecture_list_instructor_update(results);
              // response.render("my_page_instructor_update_create", {
              //   Title: "강의 리스트",
              //   authCheck: authCheck.statusUI(request, response),
              //   List: list,
              //   Name: result[0].Name,
              //   Teacher_ID: result[0].Teacher_ID,
              //   Password: result[0].Password,
              //   Phone_Number: result[0].Phone_Number,
              //   Address: result[0].Address,
              //   Email_Address: result[0].Email_Address,
              //   Point: result[0].Point,
              //   Nickname : email
              // });
            }
          );
        }
      );
    });
  }
});

router.post("/instructor/update/delete_process", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    if (!authCheck.isOwner(request, response)) {
      // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect("/auth/login");
      return false;
    } else {
      var post = request.body;
      db.query(
        "DELETE FROM Review WHERE Review_ID = ?",
        [post.id],
        function (error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, { Location: `/review` });
          response.end();
        }
      );
    }
  }
});

router.get("/update", function (request, response) {
  request.session.secret = tokens.secretSync();
  if(request.session.is_logined!=true){ //세션만료
    return response.redirect("/auth/login");
  }
  var token = tokens.create(request.session.secret);

  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Student`, function (error, Reviews) {
      if (error) {
        throw error;
      }
      var email = request.session.email;
      db.query(
        "SELECT * FROM Student WHERE Email_Address = ? ",
        [email],
        function (error2, authors) {
          if (error2) {
            throw error2;
          }
          response.render("my_page_update", {
            authCheck: authCheck.statusUI(request, response),
            Name: authors[0].Name,
            Password: authors[0].Password,
            Phone_Number: authors[0].Phone_Number,
            Address: authors[0].Address,
            Email_Address: authors[0].Email_Address,
          });
        }
      );
    });
  }
});

router.get("/update", function (request, response) {
  request.session.secret = tokens.secretSync();
  if(request.session.is_logined!=true){ //세션만료
    return response.redirect("/auth/login");
  }
  var token = tokens.create(request.session.secret);
  db.query(`SELECT * FROM Instructor`, function (error, Reviews) {
    if (error) {
      throw error;
    }
    var email = request.session.email;
    db.query(
      "SELECT * FROM Instructor WHERE Email_Address = ? ",
      [email],
      function (error2, Instructor) {
        if (error2) {
          throw error2;
        }
        console.log(Instructor);

        var dataList = [];
        if (Instructor !== undefined || Instructor[0].length > 0) {
          //선생일경우
          db.query(
            "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
            [email],
            function (error2, Instructor) {
              if (error2) throw error2;
              if (!authCheck.isOwner(request, response)) {
                // 로그인 안되어있으면 로그인 페이지로 이동시킴
                res.redirect("/auth/login");
                return false;
              } else {
                for (var data of Instructor) dataList.push(data);
                console.log(Instructor);
                var Update_list = template.Update_list(results);
              }
            }
          );
        }
        setTimeout(function () {
          var Update_list = template.Update_list(dataList);
          res.render("my_page_update", {
            authCheck: authCheck.statusUI(req, res),
            Update_list: Update_list,
          });
        }, 200);
      }
    );
  });

  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Student`, function (error, Reviews) {
      if (error) {
        throw error;
      }
      var email = request.session.email;
      db.query(
        "SELECT * FROM Student WHERE Email_Address = ? ",
        [email],
        function (error2, authors) {
          if (error2) {
            throw error2;
          }
          // console.log(authors)
          response.render("my_page_update", {
            authCheck: authCheck.statusUI(request, response),
            Name: authors[0].Name,
            Password: authors[0].Password,
            Phone_Number: authors[0].Phone_Number,
            Address: authors[0].Address,
            Email_Address: authors[0].Email_Address,
          });
        }
      );
    });
  }
});

router.get("/user_information_change", (request, response) => {
  response.render("user_information_change");
});

router.post("/update_mypage", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var post = request.body;
    console.log(post);
    db.query(
      "UPDATE Student SET Name=?, Phone_Number=? , Password=? ,Address=?, Email_Address=?  WHERE Student_ID=?",
      [
        post.Name,
        post.Phone_Number,
        post.Password,
        post.Address,
        post.Email_Address,
        post.id,
      ],
      function (error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, { Location: `/myinfo` });
        response.end();
      }
    );
  }
});

router.get("/lecture_list", (request, response) => {
  console.log(request.session.email);
  db.query(
    `select * from Student where Email_Address = ?;`,
    [request.session.email],
    (error1, result) => {
      if (error1) throw error1;
      console.log("result", result);
      db.query(
        `select * from Section as S left join Instructor_Time_Date as ITD on S.Course_ID = ITD.Course_ID and S.TIME_ID = ITD.TIME_ID and S.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = S.Teacher_ID left join Course as C on S.Course_ID = C.Course_ID left join Instructor_TIME as IT on S.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on S.DATE_ID = ID.DATE_ID where Student_ID = ?;`,
        [result[0].Student_ID],
        (error2, results) => {
          if (error2) throw error2;
          console.log("results", results);
          var list = template.lecture_list(results);
          response.render("lecture_list", {
            Title: "강의 리스트",
            authCheck: authCheck.statusUI(request, response),
            List: list,
          });
        }
      );
    }
  );
});

router.get("/class", (req, res) => {
  res.render("home");
});

module.exports = router;
