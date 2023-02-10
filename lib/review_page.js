var express = require('express');
var router = express.Router();
var authCheck = require('../lib_login/authCheck.js');
var template = require('./template');
var db = require('../db');
var sanitizeHtml = require('sanitize-html');
var Tokens = require("csrf");
var tokens = new Tokens();
let start = Date.now();
const date_now = new Date(start);

router.get('/', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    db.query(`SELECT * FROM Review`, function(error,Reviews){
      var title = '';
      var Description = '리뷰입니다';
      var list = template.list(Reviews);
      response.render('review_page_root',
      {
        authCheck : authCheck.statusUI(request, response),
        List : list,
        Title : title
      });
  })
  }
})

router.get('/page/:pageId', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
  db.query(`SELECT * FROM Review`, function(error,Reviews){
    console.log('req',request);
      if(error){
        throw error;
      }
      db.query(`SELECT * FROM Review LEFT JOIN Student ON Review.Student_ID=Student.Student_ID WHERE Review.Review_ID=?`,[request.params.pageId], function(error2, Review){
        if(error2){
          throw error2;
        }
        console.log(Review);
        var title = Review[0].Title;
        var description = Review[0].Description;
        var login_ID =Review[0].Login_ID
        var list = template.list(Reviews);
        var pageID = request.params.pageId
        response.render('review_page_enter',
        {
        authCheck : authCheck.statusUI(request, response),
        List : list,
        Title : title,
        Description : description,
        Login_ID : login_ID,
        Page_ID : pageID
        });
     })
  })
}
})

router.get('/create', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    if (!authCheck.isOwner(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
      response.redirect('/auth/login');
      return false;
    }else {
       db.query(`SELECT * FROM Review`, function(error,Reviews){
        db.query('SELECT * FROM Student', function(error2, authors){
          var nickname = request.session.nickname;
          var Title = 'Create';
          var list = template.list(Reviews);
          console.log(list);
          response.render('review_page_create',
          {
            authCheck : authCheck.statusUI(request, response),
            List : list,
            Nickname : nickname
          });
      });
    })
  }
}
})


router.post('/create_process',function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    if (!authCheck.isOwner(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect('/auth/login');
      return false;
    }else {
      var post = request.body;
      var sanitize_title = sanitizeHtml(post.Title);
      var sanitize_description = sanitizeHtml(post.Description);
      var sanitize_Email_Address = sanitizeHtml(request.session.email);
      console.log('sani',sanitize_title, sanitize_description);
      if(sanitize_title != '' && sanitize_description != ''){
        db.query(`
          INSERT INTO Review (Student_ID, Title, Description, Create_at, Email_Address, Order_subject) 
            VALUES(?, ?, ?, ?, ?, ?)`,
          [request.session.Student_Id, sanitize_title, sanitize_description, date_now, sanitize_Email_Address,1], 
          function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/review/create`});
            response.end();
          }
        )
      }else{
        response.send(`<script type="text/javascript">alert("잘못된 정보를 입력했습니다."); 
        document.location.href="/review/create";</script>`); 
      }
    }
  }
})


  router.get('/update/:pageId',function(request,response){
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
      if (!authCheck.isOwner(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        res.redirect('/auth/login');
        return false;
      }else {      
        db.query('SELECT * FROM Review', function(error, Reviews){
            if(error){
              throw error;
            }
            db.query(`SELECT * FROM Review WHERE Review_ID=?`,[request.params.pageId], function(error2, Review){
              if(error2){
                throw error2;
              }
              db.query('SELECT * FROM Student', function(error2, authors){
                var nickname = request.session.nickname;
                var list = template.list(Reviews);
                var title = Review[0].Title;
                var description = Review[0].Description;
                var login_ID =Review[0].Login_ID
                var list = template.list(Reviews);
                var review_ID = Review[0].id;
                response.render('review_page_update',
                {
                authCheck : authCheck.statusUI(request, response),
                List : list,
                Title : title,
                Description : description,
                Login_ID : login_ID,
                Nickname : nickname,
                Review_ID : review_ID,
                });
              });
            });
        });
      }
    }
})


router.post('/update_process', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect('/auth/login');
      return false;
    }else {
      var post = request.body;
      console.log(post);
      var sanitize_title = sanitizeHtml(post.Title);
      var sanitize_description = sanitizeHtml(post.Description);
      console.log('sani',sanitize_title, sanitize_description);
      if(sanitize_title != '' && sanitize_description != ''){
        db.query('UPDATE Review SET Title=?, Description=?, Student_ID=? WHERE Review_ID=?', [post.Title, post.Description, post.author_id, post.id], function(error, result){
          response.redirect(`/review/page/${post.id}`)
        })
      }else{
        response.redirect(`/review/page/${post.id}`)
      }
    }
  }
});

router.post('/delete_process', function(request, response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    if (!authCheck.isOwner(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect('/auth/login');
      return false;
    }else {
      var post = request.body;
      db.query('DELETE FROM Review WHERE Review_ID = ?', [post.id], function(error, result){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location: `/review`});
        response.end();
      });
    }
  }
});
module.exports = router;
