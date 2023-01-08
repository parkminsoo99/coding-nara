const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)
const app = express()
const port = 3000
var qs = require('querystring');

var authRouter = require('./lib_login/auth');
var authCheck = require('./lib_login/authCheck.js');
var template_main = require('./lib_login/template.js');
var template = require('./lib/template.js');
var db = require('./db');

// app.use('/auth',bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore(),
}))
app.get('/', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/main');
    return false;
  } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect('/main');
    return false;
  }
})
// // app.get('/', (req, res) => {
// //   if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
// //     res.redirect('/auth/login');
// //     return false;
// //   } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
// //     res.redirect('/main');
// //     return false;
// //   }
// // })

// app.get('/enroll', (req, res) => {  //신청
//   if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
//     res.redirect('/auth/login');
//     return false;
//   } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
//     res.redirect('/enroll/subject');
//     return false;
//   }
// })



// // 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.get('/main', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template_main.HTML('Welcome',
    `<hr>
        <h2>메인 페이지에 오신 것을 환영합니다</h2>
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})
//커리큘럼
app.get('/curriculum', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template_main.HTML('Welcome',
    `<hr>
        <h2>커리큘럼</h2>
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})

//수강신청
app.get('/enroll/sub', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  }
  var html = template_main.HTML('Welcome',
    `<hr>
        <h2>수강신청에 오신 것을 환영합니다</h2>
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})

// //강좌후기
// // app.get('/review', (req, res) => {
// //   // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있어도 로그인 페이지로 이동시킴
// //   //   res.redirect('/auth/login');
// //   //   return false;
// //   // }
// //   var html = template.HTML('Welcome',
// //     `<hr>
// //         <h2>강좌후기에 오신 것을 환영합니다</h2>
// //         `,   
// //     authCheck.statusUI(req, res)
// //   );
// //   res.send(html);
// // })

//고객센터
app.get('/ask', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있어도 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template_main.HTML('Welcome',
    `<hr>
        <h2>고객센터에 오신 것을 환영합니다</h2>
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})

app.get('/review', (request,response) =>
db.query(`SELECT * FROM topic`, function(error,topics){
    var title = '목록';
    var description = '리뷰입니다';
    var list = template.list(topics);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`,
      authCheck.statusUI(request, response)
    );
    response.send(html);
  })
)
app.get('/page/:pageId', (request,response) =>

db.query(`SELECT * FROM topic`, function(error,topics){
    if(error){
      throw error;
    }
    db.query(`SELECT * FROM topic LEFT JOIN Student ON topic.author_id=Student.Student_ID WHERE topic.id=?`,[request.params.pageId], function(error2, topic){
      if(error2){
        throw error2;
      }
      console.log(topic);
     var title = topic[0].title;
     var description = topic[0].description;
     var list = template.list(topics);
     var html = template.HTML(title, list,
       `
       <h2>${title}</h2>
       ${description}
       <p>by ${topic[0].userid}</p>
       `,
       ` <a href="/create">create</a>
           <a href="/update/${request.params.pageId}">update</a>
           <form action="/delete_process" method="post">
             <input type="hidden" name="id" value="${request.params.pageId}">
             <input type="submit" value="delete">
           </form>`,
           authCheck.statusUI(request, response)
     );
     response.send(html);
    })
 })
)

app.get('/create', (request,response) =>
db.query(`SELECT * FROM topic`, function(error,topics){
    db.query('SELECT * FROM Student', function(error2, authors){
      var nickname = request.session.nickname;
      var title = 'Create';
      var list = template.list(topics);
      var html = template.HTML(title, list,
        `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            ${template.authorSelect(authors)}
            ${request.session.nickname}
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a>`,
        authCheck.statusUI(request, response)
      );
      console.log(template.authorSelect(authors, topics[0].author_id, nickname));
      response.writeHead(200);
      response.end(html);
    });
  })
  )

  app.post('/create_process',function(request,response){
          var post = request.body;
          console.log(post);
          db.query(`
            INSERT INTO topic (title, description, created, author_id ) 
              VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, post.author], 
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/create`});
              response.end();
            }
          )
      })


    app.get('/update/:pageId',function(request,response){
        db.query('SELECT * FROM topic', function(error, topics){
            if(error){
              throw error;
            }
            db.query(`SELECT * FROM topic WHERE id=?`,[request.params.pageId], function(error2, topic){
              if(error2){
                throw error2;
              }
              db.query('SELECT * FROM Student', function(error2, authors){
                var nickname = request.session.nickname;
                var list = template.list(topics);
                var html = template.HTML(topic[0].title, list,
                  `
                  <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${topic[0].id}">
                    <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                    <p>
                      <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                    </p>
                    <p>
                      ${template.authorSelect(authors, topic[0].author_id, nickname)}
                      ${request.session.nickname}
                    </p>
                    <p>
                      <input type="submit">
                    </p>
                  </form>
                  `,
                  `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`,
                  authCheck.statusUI(request, response)
                );
                response.send(html);
              });
            });
        });
    })


    app.post('/update_process', function(request,response){
          var post = request.body;
          console.log(post);
          db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?', [post.title, post.description, post.author, post.id], function(error, result){
            response.writeHead(302, {Location: `/page/${post.id}`});
            response.end();
          })
      });



    app.post('/delete_process', function(request, response){
          var post = request.body;
          db.query('DELETE FROM topic WHERE id = ?', [post.id], function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/review`});
            response.end();
          });
      });




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})