var express = require('express');
var router = express.Router();
var template_main = require('../lib_login/template.js');
var authCheck = require('../lib_login/authCheck.js');
var template = require('./template');
var db = require('../db');




router.get('/', (request,response) =>
db.query(`SELECT * FROM Review`, function(error,Reviews){
    var Title = '목록';
    var Description = '리뷰입니다';
    var list = template.Enroll_list(Reviews);
    var html = template.HTML(Title, list,
      `<h2>${Title}</h2>${Description}`,
      `<a href="/review/create">create</a>`,
      authCheck.statusUI(request, response)
    );
    response.send(html);
  })
)

router.get('/page/:pageId', (request,response) =>
db.query(`SELECT * FROM Review`, function(error,Reviews){
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
           <form action="/delete_process" method="post">
             <input type="hidden" name="id" value="${request.params.pageId}">
             <input type="submit" value="delete">
              </form>`
           ,
           authCheck.statusUI(request, response)
     );
     response.send(html);
    })
 })
)

router.get('/create', (request,response) =>
db.query(`SELECT * FROM Review`, function(error,Reviews){
    db.query('SELECT * FROM Student', function(error2, authors){
      var nickname = request.session.nickname;
      var Title = 'Create';
      var list = template.list(Reviews);
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
      response.writeHead(200);
      response.end(html);
    });
  })
  )

  router.post('/create_process',function(request,response){
          var post = request.body;
          console.log(post);
          db.query(`
            INSERT INTO Review (Title, Description, Create_at, Student_ID, Order_subject) 
              VALUES(?, ?, NOW(), ?, ?)`,
            [post.Title, post.Description, post.author, post.author], 
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/review/create`});
              response.end();
            }
          )
      })


      router.get('/update/:pageId',function(request,response){
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
                  <form action="/update_process" method="post">
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
    })


    router.post('/update_process', function(request,response){
          var post = request.body;
          console.log(post);
          db.query('UPDATE Review SET Title=?, Description=?, Student_ID=? WHERE Review_ID=?', [post.Title, post.Description, post.author_id, post.id], function(error, result){
            response.writeHead(302, {Location: `/page/${post.id}`});
            response.end();
          })
      });



      router.post('/delete_process', function(request, response){
          var post = request.body;
          db.query('DELETE FROM Review WHERE Review_ID = ?', [post.id], function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/review`});
            response.end();
          });
      });


      module.exports = router;
