import path from "path";
import SocketIO from "socket.io";
import http from "http";

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
var main_Router = require('./lib/main_page');
var curi_Router = require('./lib/curi_page');
var ask_Router = require('./lib/ask_page');
var mypage_Router = require('./lib/my_page');
var enroll_Router = require('./lib/enroll_page');
var review_Router = require('./lib/review_page');
var db = require('./db');
const { response } = require('express');
const { Enroll_list } = require('./lib/template.js');
const handleListen = () => console.log("Listen on http://localhost:3000");

const __dirname = path.resolve();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use("/static", express.static(__dirname + "/static"));
app.use("/image", express.static(__dirname + "/image"));


// app.use('/auth',bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),
}))
app.get('/', (req, res) => {
    res.redirect('/main');
})

// // 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.use('/main', main_Router);

//커리큘럼
app.use('/curriculum', curi_Router);

app.use('/ask', ask_Router);

//고객센터
app.use('/enroll', enroll_Router);

app.use('/review', review_Router);

app.use('/myinfo', mypage_Router);//마이페이지


// 서버 만들고
const httpServer = http.createServer(app);
// 소켓 서버랑 합치기
const wsServer = SocketIO(httpServer);

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

 