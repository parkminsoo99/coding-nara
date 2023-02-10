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
        db.query(`select * from Section as S left join Instructor_Time_Date as ITD on S.Course_ID = ITD.Course_ID and S.TIME_ID = ITD.TIME_ID and S.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = S.Teacher_ID left join Course as C on S.Course_ID = C.Course_ID left join Instructor_TIME as IT on S.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on S.DATE_ID = ID.DATE_ID where Student_ID = ?;`,
        [result[0].Student_ID],(error2, results) => {
          if(error2) throw error2;
          console.log('results',results)
          var list = template.lecture_list(results);
          response.render('my_page_root',
          {
            Title : '강의 리스트',
            authCheck : authCheck.statusUI(request, response),
            List : list,
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
      Name : authors[0].Name,
      Password : authors[0].Password,
      Phone_Number : authors[0].Phone_Number,
      Address : authors[0].Address,
      Email_Address : authors[0].Email_Address,
    });
    });
  })}
})

router.get('/user_information_change', (request, response) => {
  response.render('user_information_change');
})

router.post('/update_mypage', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    var post = request.body;
    console.log(post);
    db.query('UPDATE Student SET Name=?, Phone_Number=? , Password=? ,Address=?, Email_Address=?  WHERE Student_ID=?', [post.Name, post.Phone_Number, post.Password, post.Address, post.Email_Address, post.id], function(error, result){
      if(error){
        throw error;
      }  
      response.writeHead(302, {Location: `/myinfo`});
      response.end();
    })
  }
});

router.get('/lecture_list', (request, response) => {
  console.log(request.session.email)
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
