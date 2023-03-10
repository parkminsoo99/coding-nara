import path from "path";
import SocketIO from "socket.io";
import http from "http";
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)
const fs = require("fs");
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

const multer = require("multer");
const handleListen = () => console.log("Listen on https://coding-nara.com:54213");
const __dirname = path.resolve();

const storage = multer.diskStorage({ //파일저장
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

const upload = multer({ storage: storage })
/*nsp check로 package.json에 있는 dependencies를 체크하여 문제가 있는 것들을 알려준다.*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");
app.use("/js", express.static(__dirname + "/js"));
app.use("/CSS", express.static(__dirname + "/CSS"));
app.use("/static", express.static(__dirname + "/static"));
app.use("/image", express.static(__dirname + "/image"));
app.use("/assets", express.static(__dirname + "/assets"));
app.use("/uploads", express.static(__dirname + "/uploads"));
// app.use("/uploads", express.static("/uploads"));

app.set('views', __dirname + "/views" );
app.set("view engine", "ejs");

app.use("/main",session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),

}))
app.use("/main",session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),

}))
app.use("/auth",session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),

}))
app.use("/ask",session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),

}))
app.use("/myinfo",session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),

}))
app.use("/enroll",session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),

}))
app.use("/review",session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),

}))
app.use("/curriculum",session({
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
    "default-src":["'self'","*.google.com","'unsafe-inline'"],
    "frame-src" :['*'],
    "form-action" : ["'self'",'*.inicis.com','*.localhost:54213'],
    "script-src": ["'self'",'*.daumcdn.net','parsleyjs.org','*.naver.com',"unpkg.com","*.googleapis.com","*.cloudflare.com","*.jsdelivr.net","*.startbootstrap.com","*.kakaocdn.net",'*.jquery.com','*.iamport.kr','*.inicis.com',"'unsafe-inline'"],
    "script-src-attr" : ["'self'","'unsafe-inline'"],
    "img-src": ["'self'", 'data:', "*.naver.com", "*.kakaocdn.net","localhost:54213","'unsafe-inline'"],
    "connect-src" : ["'self'","'unsafe-inline'","unpkg.com"],
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


app.get('/', (req, res) => {
  
  apiLimiter,
  res.redirect('/main');
})
app.post('/upload', upload.single('image'), (req, res, next) => {
  console.log(req.file.path);
  
  res.status(200).send({
      message: "Ok",
      fileInfo: req.file
  })
});


app.get("/room", (req, res) => {
  res.render("home");
});

app.get("/policy/private", (req, res) => {
  res.render("policy_private");
});
app.get("/policy/tos", (req, res) => {
  res.render("tos");
});

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

httpServer.listen(port, apiLimiter,handleListen =>{
  const dir = "./uploads";
    if(!fs.existsSync(dir)) {
    	fs.mkdirSync(dir);
    }
    console.log("서버 실행");

});

 