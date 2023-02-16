var express = require('express');
var router = express.Router();
var authCheck = require('../lib_login/authCheck.js');
var db = require('../db');
var sanitizeHtml = require('sanitize-html');
var Tokens = require("csrf");
var tokens = new Tokens();
var template = require('./template');

router.get('/', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    db.query(`SELECT * FROM Student`, function(error,Reviews){
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
})
router.post('/validate_Mypage_Email', (request,response) => {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    var username = sanitizeHtml(request.body.username)
    var Email_Address = sanitizeHtml(request.body.EA)
    console.log(username, Email_Address)
    if(request.body.hideCK) {
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
  if(request.session.email_mypage_check === 1){
    response.send({result : 1})
  }else{
    response.send({result : 2})
  }
})
router.get('/update', function (request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
  db.query(`SELECT * FROM Student`, function(error,Reviews){
  if(error){
  throw error;
  }
    var email = request.session.email;
    db.query('SELECT * FROM Student WHERE Email_Address = ? ',[email], function(error2, authors){
      if(error2){
      throw error2;
    }
    console.log(authors)
    response.render('my_page_update',
    {
      authCheck : authCheck.statusUI(request, response),
      Nickname : authors[0].Name,
      Mobile : authors[0].Phone_Number,
    });
    });
  })}
})

router.get('/user_information_change', (request, response) => {
  response.render('user_information_change');
})

router.get('/refund_page',(request,response) => {
  response.render('refund_page',{
      authCheck : authCheck.statusUI(request, response),
  });
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
})

router.get("/class", (req, res) => {
    res.render("home");
  }
);


module.exports = router;
