import express from "express";
import path from "path";
import {Server} from "socket.io";
import http from "http";
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)
var qs = require('querystring');
var fs = require('fs');

var authRouter = require('./lib_login/auth');
var authCheck = require('./lib_login/authCheck.js');
var template_main = require('./lib_login/template.js');
var template = require('./lib/template.js');
var db = require('./db');
const handleListen = () => console.log("Listen on http://localhost:3000");

const __dirname = path.resolve();

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use("/static", express.static(__dirname + "/static"));

app.get("/myinfo/class", (req, res) => {
  res.render("home");
});

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

// app.get('/create', (req, res) => {  //신청
//   if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
//     res.redirect('/auth/login');
//     return false;
//   } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
//     res.redirect('/review');
//     return false;
//   }
// })



// // 인증 라우터
app.use('/auth', authRouter);
app.use('/image', express.static('image'))
// app.get('/image', (req, res) => {
//   fs.readFile('./image/1.png', function(err, data){
//     console.log('picture loading...');
//     response.writeHead(200, {'Context-Type':'text/html'});
//     response.end(data);    
// });
// })
// 메인 페이지
app.get('/main', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template_main.HTML('Welcome',
    `
    <div align=center>
    <p id="title"><h1>실시간 온라인<h2></p>
    <p id="title"><h1>코딩교육을 한곳에서</h1></p>
    <p><h3>우리 아이에 적합한 교육 서비스를 경험해보세요<h3></p>
    <button class="button-arounder" >시작하기</button>
    <p><h1>코딩나라가 제공하는 서비스<h2></p><p><h1></h1></p>
    <div id="borderDemo">
        <h1>처음 접하는 아이들에게 맞춤교육</h1>
      <div id="bg2">
      </div>
      <h2 id="mg">코딩의 첫걸음을 쉽게 이끌어주도록 도와줍니다</h2>
    <p><h1>잘 성립된 커리큘럼</h1><p>
    <div id="bg3" align=center>
      </div>
      <h2 id="mg">단계별로 과목이 나누어져 있으며 아이들에게 맞춰서 진행합니다.</h2>
    <p><h1>1대1로 실시간으로 문제 해결</h1></p>
    <div id="bg4">
      </div>
      <h2 id="mg">처음 접하는 아이들에게 맞춤교육</h2>
    <p><h1>어디서든 들을 수 있는 교육</h1></p>
    <div id="bg5">
      </div>
      <h2 id="mg">처음 접하는 아이들에게 맞춤교육</h2>
    <p><h1>원하는 시간을 선택</h1></p>
    <div id="bg6">
      </div>
    </div>
    <p><h3><h3></p>
    
    
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
    `<div align=left>
    </p><h1>자주 묻는 질문<h2></p>
    </div>
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
      `<a href="/create">글쓰기</a>`,
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
       ` <a href="/create">글쓰기</a>
           <a href="/update/${request.params.pageId}">수정</a>
           `,
           authCheck.statusUI(request, response)
     );
     response.send(html);
    })
 })
)

app.get('/create', (request,response) =>

db.query(`SELECT * FROM Review`, function(error,Reviews){
    db.query('SELECT * FROM Student', function(error2, authors){
      if (!authCheck.isOwner(request, response)) {  // 로그인 안되어있어도 로그인 페이지로 이동시킴
        response.redirect('/auth/login');
        return false;
      }
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
            ${template.authorSelect_create(authors,nickname)}
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">글쓰기</a>`,
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
            INSERT INTO Review (Title, Description, Create_at, Student_ID) 
              VALUES(?, ?, NOW(), ?)`,
            [post.Title, post.Description, post.author_id], 
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
                console.log(authors);
                console.log(Review[0].Student_ID);
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
                      ${template.create_auth(authors, Review[0].Student_ID, nickname)}
                      ${template.authorSelect(authors, Review[0].Student_ID, nickname)}
                    </p>
                    <p>
                      <input type="submit">
                    </p>
                  </form>
                  <form action="/delete_process" method="post">
             <input type="hidden" name="id" value="${request.params.pageId}">
             <input type="submit" value="삭제">
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
          var nickname = request.session.nickname;
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
            var Title = '내정보';
            var html = template.HTML(Title, '',
              `
                <p>이름 ${authors[0].Name}</p>
                <p>비밀번호 ${authors[0].Password}</p>
                <p>전화번호 ${authors[0].Phone_Number}</p>
                <p>주소 ${authors[0].Address}</p>
                <p>이메일 ${authors[0].Email_Address}</p>
                <p>적립금 ${authors[0].Point}</p>
              `,
              `<a href="/myinfo/update">수정</a>
               <a href="/myinfo/class">내강의실</a>
              `,
              authCheck.statusUI(request, response)
            );
            response.writeHead(200);
            response.end(html);
          });
        })
        )

        app.get('/myinfo/update', (request,response) =>
      db.query(`SELECT * FROM Student`, function(error,Reviews){
          if(error){
          throw error;
          }
            var nickname = request.session.nickname;
            
            db.query('SELECT * FROM Student WHERE Login_ID = ? ',[nickname], function(error2, authors){
                if(error2){
                throw error2;
              }
            //console.log(authors);
            var Title = '내정보';
            
            var html = template.HTML(Title, '',
              `
              <form action="/update_mypage" method="post">
              <input type="hidden" name="id" value="${authors[0].Student_ID}">
              <p>이름<input type="text" name="Name" placeholder="Name" value="${authors[0].Name}"></p>
              <p>전화번호<input type="text" name="Phone_Number" placeholder="Phone_Number" value="${authors[0].Phone_Number}"></p>
              <p>비밀번호<input type="text" name="Password" placeholder="Password" value="${authors[0].Password}"></p>
              <p>주소<input type="text" name="Address" placeholder="Address" value="${authors[0].Address}"></p>
              <p>이메일<input type="text" name="Email_Address" placeholder="Email_Address" value="${authors[0].Email_Address}"></p>
              <p>
                <input type="submit">
              </p>
              </form>
              `,
              ``,
              authCheck.statusUI(request, response)
            );
            response.writeHead(200);
            response.end(html);
          });
        })
        )

        app.post('/update_mypage', function(request,response){
          var post = request.body;
          console.log(post);
          db.query('UPDATE Student SET Name=?, Phone_Number=? , Password=? ,Address=?, Email_Address=?  WHERE Student_ID=?', [post.Name, post.Phone_Number, post.Password, post.Address, post.Email_Address, post.id], function(error, result){
            if(error){
              throw error;
              }  
            response.writeHead(302, {Location: `/myinfo`});
            response.end();
          })
      });


// 서버 만들고
const httpServer = http.createServer(app);
// 소켓 서버랑 합치기
const wsServer = new Server(httpServer);

//소켓 연결시
wsServer.on("connection", (socket) => {
  // join Room
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });

  // offer
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });

  // answer
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });

  //ice
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

httpServer.listen(3000, handleListen);
