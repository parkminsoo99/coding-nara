import path from "path";
import SocketIO from "socket.io";
import http from "http";
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)
const app = express()
const port = 54213
var qs = require('querystring');
var authRouter = require('./lib_login/auth');
var main_Router = require('./lib/main_page');
var curi_Router = require('./lib/curi_page');
var ask_Router = require('./lib/ask_page');
var mypage_Router = require('./lib/my_page');
var enroll_Router = require('./lib/enroll_page');
var review_Router = require('./lib/review_page');
const handleListen = () => console.log("Listen on http://localhost:54213");

const __dirname = path.resolve();
/*nsp check로 package.json에 있는 dependencies를 체크하여 문제가 있는 것들을 알려준다.*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use("/static", express.static(__dirname + "/static"));
app.use("/image", express.static(__dirname + "/image"));
app.use(session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),

}))
/*보안*/
var helmet = require('helmet');
app.use(helmet());
app.use(helmet.xssFilter());
app.disable("x-powered-by");
app.use(helmet.frameguard("deny"));
app.use(helmet.noSniff());
app.use((req, res, next) => {
  res.removeHeader("Cross-Origin-Embedder-Policy");
  next();
});
app.use(helmet.contentSecurityPolicy({
  directives: {
    "default-src":["'self'","'unsafe-inline'"],
    "frame-src" :['*'],
    "form-action" : ["'self'",'*.inicis.com','*.localhost'],
    "script-src": ["'self'",'*.naver.com',"*.googleapis.com","*.kakaocdn.net",'*.jquery.com','*.iamport.kr','*.inicis.com',"'unsafe-inline'"],
    "script-src-attr" : ["'self'","'unsafe-inline'"],
    "img-src": ["'self'", 'data:', "*.naver.com", "*.kakaocdn.net","localhost:3000","'unsafe-inline'"],
    "connect-src" : ["'self'","'unsafe-inline'"],
    "media-src" : ["'self'","'unsafe-inline'"],
  },
}));

/*CSRF*/
var Tokens = require("csrf");
var tokens = new Tokens();

/*DDOS*/
var rateLimit = require("express-rate-limit"); 
const apiLimiter =  rateLimit({ 
  windowMs: 1*60*1000, 
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use("/main", apiLimiter); 


app.get('/', (req, res) => {
  apiLimiter,
  res.redirect('/main');
})


// // 인증 라우터
app.use('/auth', apiLimiter, authRouter);

// 메인 페이지
app.use('/main', apiLimiter, main_Router);

//커리큘럼
app.use('/curriculum', apiLimiter, curi_Router);

app.use('/ask', apiLimiter, ask_Router);

//고객센터
app.use('/enroll', apiLimiter, enroll_Router);

app.use('/review', apiLimiter, review_Router);

app.use('/myinfo', apiLimiter, mypage_Router);//마이페이지


// 서버 만들고
const httpServer = http.createServer(app);
// 소켓 서버랑 합치기
const wsServer = SocketIO(httpServer);

//소켓 연결시
wsServer.on("connection", (socket) => {
  apiLimiter,
  // join Room
  socket.on("join_room", (roomName) => {
    apiLimiter,
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });

  // offer
  socket.on("offer", (offer, roomName) => {
    apiLimiter,
    socket.to(roomName).emit("offer", offer);
  });

  // answer
  socket.on("answer", (answer, roomName) => {
    apiLimiter,
    socket.to(roomName).emit("answer", answer);
  });

  //ice
  socket.on("ice", (ice, roomName) => {
    apiLimiter,
    socket.to(roomName).emit("ice", ice);
  });
});

httpServer.listen(port, apiLimiter,handleListen);

 