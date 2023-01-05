const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)

var authRouter = require('./lib_login/auth');
var authCheck = require('./lib_login/authCheck.js');
var template = require('./lib_login/template.js');


const app = express()
const port = 3000

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
// app.get('/', (req, res) => {
//   if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
//     res.redirect('/auth/login');
//     return false;
//   } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
//     res.redirect('/main');
//     return false;
//   }
// })

app.get('/enroll', (req, res) => {  //신청
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect('/enroll/subject');
    return false;
  }
})




// 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.get('/main', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template.HTML('Welcome',
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
  var html = template.HTML('Welcome',
    `<hr>
        <h2>커리큘럼</h2>
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})

//수강신청
app.get('/enroll/subject', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template.HTML('Welcome',
    `<hr>
        <h2>수강신청에 오신 것을 환영합니다</h2>
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})

//강좌후기
app.get('/review', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있어도 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template.HTML('Welcome',
    `<hr>
        <h2>강좌후기에 오신 것을 환영합니다</h2>
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})

//고객센터
app.get('/ask', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있어도 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template.HTML('Welcome',
    `<hr>
        <h2>고객센터에 오신 것을 환영합니다</h2>
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})