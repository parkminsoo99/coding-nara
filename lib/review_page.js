var express = require('express');
var router = express.Router();
var template_main = require('../lib_login/template.js');
var authCheck = require('../lib_login/authCheck.js');
var template = require('./template');
var db = require('../db');
var sanitizeHtml = require('sanitize-html');
var Tokens = require("csrf");
var tokens = new Tokens();

router.get('/', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    db.query(`SELECT * FROM Review`, function(error,Reviews){
      var Title = '목록';
      var Description = '리뷰입니다';
      var list = template.list(Reviews);
      var html = template.HTML(Title, list,
        `<h2>${Title}</h2>${Description}`,
        `<a href="/review/create">create</a>`,
        authCheck.statusUI(request, response)
      );
      response.send(html);
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
        var Title = Review[0].Title;
        var Description = Review[0].Description;
        var list = template.list(Reviews);
        var html = template.HTML(Title, list,
          `
          <h2>${Title}</h2>
          ${Description}
          <p>by ${Review[0].Login_ID}</p>
          `,
          ` <a href="/review/create">create</a>
              <a href="/review/update/${request.params.pageId}">update</a>
              <form action="/review/delete_process" method="post">
                <input type="hidden" name="id" value="${request.params.pageId}">
                <input type="submit" value="delete">
                  </form>`
              ,
              authCheck.statusUI(request, response)
        );
        response.send(html);
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
    if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect('/auth/login');
      return false;
    }else {
       db.query(`SELECT * FROM Review`, function(error,Reviews){
        db.query('SELECT * FROM Student', function(error2, authors){
          var nickname = request.session.nickname;
          var Title = 'Create';
          var list = template.list(Reviews);
          console.log(list);
          var html = template.HTML(Title, list,
            `
            <form action="/review/create_process" method="post">
              <p><input type="text" name="Title" placeholder="Title"></p>
              <p>
                <textarea name="Description" placeholder="Description"></textarea>
              </p>
              <p>
                ${template.authorSelect(authors)}
                ${nickname}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/review/create">create</a>`,
            authCheck.statusUI(request, response)
          );
          response.send(html);	
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
    if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect('/auth/login');
      return false;
    }else {
      var post = request.body;
      var sanitize_title = sanitizeHtml(post.Title);
      var sanitize_description = sanitizeHtml(post.Description);
      console.log('sani',sanitize_title, sanitize_description);
      if(sanitize_title != '' && sanitize_description != ''){
        db.query(`
          INSERT INTO Review (Student_ID, Title, Description, Create_at, Login_ID, Order_subject) 
            VALUES(?, ?,?,now(), ?, ?)`,
          [request.session.Student_Id, sanitize_title, sanitize_description,  post.author,1], 
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
      if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
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
                var html = template.HTML(Review[0].Title, list,
                  `
                  <form action="/review/update_process" method="post">
                    <input type="hidden" name="id" value="${Review[0].Review_ID}">
                    <p><input type="text" name="Title" placeholder="Title" value="${Review[0].Title}"></p>
                    <p>
                      <textarea name="Description" placeholder="Description">${Review[0].Description}</textarea>
                    </p>
                    <p>
                      ${template.authorSelect(authors, Review[0].Student_ID, nickname)}
                      ${request.session.nickname}
                    </p>
                    <p>
                      <input type="submit">
                    </p>
                  </form>
                  `,
                  `<a href="/review/create">create</a> <a href="/review/update?id=${Review[0].id}">update</a>`,
                  authCheck.statusUI(request, response)
                );
                response.send(html);
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
    if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
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
