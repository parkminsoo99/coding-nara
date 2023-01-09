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
db.query(`SELECT * FROM Review`, function(error,Reviews){
    var Title = '목록';
    var Description = '리뷰입니다';
    var list = template.list(Reviews);
    var html = template.HTML(Title, list,
      `<h2>${Title}</h2>${Description}`,
      `<a href="/create">create</a>`,
      authCheck.statusUI(request, response)
    );
    response.send(html);
  })
)
app.get('/page/:pageId', (request,response) =>
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
db.query(`SELECT * FROM Review`, function(error,Reviews){
    db.query('SELECT * FROM Student', function(error2, authors){
      var nickname = request.session.nickname;
      var Title = 'Create';
      var list = template.list(Reviews);
      var html = template.HTML(Title, list,
        `
        <form action="/create_process" method="post">
          <p><input type="text" name="Title" placeholder="Title"></p>
          <p>
            <textarea name="Description" placeholder="Description"></textarea>
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
      response.writeHead(200);
      response.end(html);
    });
  })
  )

  app.post('/create_process',function(request,response){
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
              response.writeHead(302, {Location: `/create`});
              response.end();
            }
          )
      })


    app.get('/update/:pageId',function(request,response){
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
                  `<a href="/create">create</a> <a href="/update?id=${Review[0].id}">update</a>`,
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
          db.query('UPDATE Review SET Title=?, Description=?, Student_ID=? WHERE Review_ID=?', [post.Title, post.Description, post.author_id, post.id], function(error, result){
            response.writeHead(302, {Location: `/page/${post.id}`});
            response.end();
          })
      });



    app.post('/delete_process', function(request, response){
          var post = request.body;
          db.query('DELETE FROM Review WHERE Review_ID = ?', [post.id], function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/review`});
            response.end();
          });
      });


      app.get('/myinfo', (request,response) =>
      db.query(`SELECT * FROM Student`, function(error,Reviews){
            var nickname = request.session.nickname;
            
            db.query('SELECT * FROM Student WHERE Login_ID = ? ',[nickname], function(error2, authors){
              console.log(authors);
            var Title = '내정보';
            var list = template.list(Reviews);
            if(authors[0].Point === null)
            {
              authors[0].Point=0;
            }
            var html = template.HTML(Title, 'list',
              `
                <p>아이디 ${authors[0].Login_ID}</p>
                <p>이름 ${authors[0].username}</p>
                <p>비밀번호 ${authors[0].password}</p>
                <p>전화번호 ${authors[0].number}</p>
                <p>주소 ${authors[0].address}</p>
                <p>이메일 ${authors[0].email}</p>
                <p>적립금 ${authors[0].Point}</p>
            
                <p>
                  <input type="submit">
                </p>
              `,
              `<a href="/create">수정</a>`,
              authCheck.statusUI(request, response)
            );
            console.log(template.authorSelect(authors, Reviews[0].author_id, nickname));
            response.writeHead(200);
            response.end(html);
          });
        })
        )



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})