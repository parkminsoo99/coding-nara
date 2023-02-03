var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
var authNum;
var Email_status ='';
var qs = require('querystring');
var db = require('../db');
const axios = require('axios');
const ejs = require('ejs');
/*네이버 로그인 관련 변수*/
var client_id = 'sIwGUXdmGRyOPin4mTnj';
var client_secret = 'bWV7qU9Ngl';
var state = "1004";
var redirectURI = encodeURI("http://localhost:54213/auth/naver/login");
var api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state;
const request = require('request-promise');
const date = require('date-and-time');
let start = Date.now();
const date_now = new Date(start);
///
var platform_type = '';
var sanitizeHtml = require('sanitize-html');
var bcrypt = require('bcrypt');
var Tokens = require("csrf");
var tokens = new Tokens();
const saltRounds = 10;
/*카카오 로그인 관련 객체*/
const kakaoData = {
    client_id : 'f28ca6f29082d1991b42941c3178fe60',
    client_secret : 'fOdmb6jteLfVhsfoWVvqm4Us5CgRc6DS',
    redirect_url : 'http://localhost:54213/auth/kakao/login',
    logout_redirect_url : 'http://localhost:54213/auth/kakao/logout'
}

// 회원가입 화면
router.get('/register', async(request, response) =>{
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        if(request.session.type=='naver'){
            console.log('naver_register_in')
            response.render('auth_register_naver',{
                Email : request.session.email,
                Nickname : request.session.nickname,
                Mobile : request.session.mobile,
            });
        }
        else if(request.session.type=='kakao'){
            console.log('kakao_register_in')
            response.render('auth_register_kakao',{
                Email : request.session.email,
                Nickname : request.session.nickname
            });
        }
        else{
            request.session.destroy();
            response.render('auth_register_main',{
                Authnum : authNum,
                Email_Status : Email_status,
            });
         }      
    }   
});

router.post('/mail', (req, res) => {
    const reademailaddress = req.body.EA;
    let emailTemplete;
    db.query(`select * from Student where Email_Address = ?`,[reademailaddress], async(error, result) => {
        if(error) throw error;
        else{
            if(result.length>0) res.send({ result : 'exist' })
            else{
                console.log('mail_req');
                let authNum = Math.random().toString().substr(2,6);
                const hashAuth = await bcrypt.hash(authNum, 12);
                console.log(hashAuth);
                req.session.hashAuth = hashAuth;
                console.log('req.session.session',req.session.hashAuth);
                res.render('mail', {authCode : authNum}, function (err, data) {
                if(err){console.log(err)}
                console.log(data)
                emailTemplete = data;
                });
                let transporter = await nodemailer.createTransport({
                    service: 'daum',
                    host: 'smtp.daum.net',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'zzangorc99',
                        pass:'aiyjweilcjjvwtfg',
                    },tls: {
                        rejectUnauthorized: false
                    }
                });
                const mailOptions = await transporter.sendMail({
                    from: `admin@coding-nara.com`,
                    to: 'zzangorc99@naver.com',
                    subject: '회원가입을 위한 인증번호를 입력해주세요.',
                    html: emailTemplete,
                });
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }else{
                        console.log('success')
                        res.send(authNum);
                        transporter.close()
                    }
                });
                return res.send({ result : 'send', HashAuth : req.session.hashAuth});
            }
        }
    })
});
router.post('/mail_expire', (req,res) => {
    console.log('me in');
    req.session.destroy(function(){ 
        req.session;
    });
})
router.post('/password_check_success', (req,res) => {
    console.log('pa in');
    req.session.password_check = 1;
    res.send();
})
router.post('/mail_validation', async (req, res, next) => {
    console.log(req.body.CEA,req.session.hashAuth)
    try {
        if(!req.session.hashAuth) res.send({ result : 'expire'});
        else if(bcrypt.compareSync(req.body.CEA, req.session.hashAuth)) {
            req.session.email_check = 1;
            res.send({ result : 'success'});
        }
        else res.send({ result : 'fail'});
    } catch(err) {
      res.send({ result : 'fail'});
      console.error(err);
      next(err);
    }
  });
// 로그인 화면
router.get('/login', function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        if(request.session.type == 'kakao') request.session.destroy();
        else if(request.session.type == 'naver') request.session.destroy();
        response.render('auth_login_main',{
            API_URL : api_url
        })
    }
});

router.get('/naver/login', async (req, res) => {
    console.log('naver in')
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        platform_type = 'naver';
            // 토큰을 발급받으려면 query string으로 넘겨야 할 정보들이다.
        const code = req.query.code;
        const state = req.query.state;

            // 로그인 API를 사용해 access token을 발급받는다.
        const naver_api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='+ client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
        const options = {
            url: naver_api_url,
            headers: {
                'X-Naver-Client-Id': client_id, 
                'X-Naver-Client-Secret': client_secret
            }
        }
        const result = await request.get(options);
            // string 형태로 값이 담기니 JSON 형식으로 parse를 해줘야 한다.
        const token = JSON.parse(result).access_token;

        // 발급 받은 access token을 사용해 회원 정보 조회 API를 사용한다.
        const info_options = {
            url: 'https://openapi.naver.com/v1/nid/me',
            headers: {'Authorization': 'Bearer ' + token}
        };

        const info_result = await request.get(info_options);
            // string 형태로 값이 담기니 JSON 형식으로 parse를 해줘야 한다.
        const info_result_json = JSON.parse(info_result).response;
        
        db.query(`SELECT * FROM Student WHERE Email_Address = ?`, [info_result_json.email],
                function(error,results1){
                    if(error) throw error;
                    if (results1.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                        req.session.type = platform_type;
                        req.session.email = info_result_json.email;
                        req.session.is_logined = true;      // 세션 정보 갱신
                        req.session.nickname = info_result_json.name;
                        req.session.mobile = info_result_json.mobile;
                        req.session.save(function () {
                            res.redirect(`/`);
                        });
                    }
                    else{
                        req.session.type = platform_type;
                        req.session.email = info_result_json.email;
                        req.session.is_logined = true;      // 세션 정보 갱신
                        req.session.nickname = info_result_json.name;
                        req.session.mobile = info_result_json.mobile;
                        req.session.save(function () {
                            res.redirect('/auth/register');
                        });   
                    }
                })
            }
})
router.get('/kakao/in',(req,res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        const kakaoAuthroize = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoData.client_id}&redirect_uri=${kakaoData.redirect_url}`
        res.redirect(kakaoAuthroize);
    }
})

router.get('/kakao/logout', async (req,res)=>{
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        req.session.destroy();
        const kakaoAuthroize = 'https://kauth.kakao.com/oauth/logout?client_id=f28ca6f29082d1991b42941c3178fe60&logout_redirect_uri=http://localhost:54213/'
        res.redirect(kakaoAuthroize);
    }
  })
router.get('/kakao/login', async(req, res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        try{
            platform_type = "kakao";
            console.log('platform',platform_type);
            console.log('inin');
            const url = 'https://kauth.kakao.com/oauth/token'
            const body = qs.stringify({
                grant_type : 'authorization_code',
                client_id: kakaoData.client_id,
                client_secret : kakaoData.client_secret,
                redirect_url : kakaoData.redirect_url,
                code : req.query.code
            })
            const header = {'content-Type' : 'application/x-www-form-urlencoded;charset=utf-8'}
            const response = await axios.post(url,body,header);
            const token = response.data.access_token;
            console.log("res", response.data.account_email);
            const user = await axios.get('https://kapi.kakao.com/v2/user/me',{
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8',
                    'Authorization':`Bearer ${token}`
                }
            })
            const { nickname } = user.data.properties;
            const { email } = user.data.kakao_account;
            db.query(`SELECT * FROM Student WHERE Email_Address = ?`, [email],
            function(error,results1){
                
                console.log('result1',results1);
                if(error) throw error;
                if (results1.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                    req.session.type = platform_type;
                    req.session.email = email;
                    req.session.is_logined = true;      // 세션 정보 갱신
                    req.session.nickname = nickname;
                    req.session.save(function () {
                        res.redirect(`/`);
                    });
                }
                else{
                    console.log('토큰!', token);
                    req.session.type = platform_type;
                    req.session.email = email;
                    req.session.is_logined = true;      // 세션 정보 갱신
                    req.session.nickname = nickname;
                    req.session.save(function () {
                        res.redirect('/auth/register');
                    });   
                }
            })
        }catch{
            console.log('실패!');
            res.redirect('/');
        }
    }
})

router.post('/login_process', function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Email_Address = request.body.Email_Address;
        var password = request.body.pwd;
        var sanitizeHtml_Email_Address = sanitizeHtml(Email_Address);
        var sanitizeHtml_password = sanitizeHtml(password);
        if(sanitizeHtml_Email_Address  != '' && sanitizeHtml_password != '' ){
            if (sanitizeHtml_Email_Address && sanitizeHtml_password) {             // id와 pw가 입력되었는지 확인
                db.query('SELECT * FROM Student WHERE Email_Address = ?', [sanitizeHtml_Email_Address], function(error, results, fields) {
                    if (error) throw error;
                    if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                        bcrypt.compare(password,results[0].Password, function(err, result){
                            if(result){
                                console.log(results[0].Email_Address);
                                request.session.is_logined = true;      // 세션 정보 갱신
                                request.session.email = results[0].Email_Address
                                request.session.Student_Id = results[0].Student_ID;
                                request.session.save(function () {
                                response.redirect(`/`);
                            }); 
                            }else{
                                response.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                                document.location.href="/auth/login";</script>`);    
                            }
                        })
                    } else {              
                        response.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                        document.location.href="/auth/login";</script>`);    
                    }           
                }
                )} else {
                response.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
                document.location.href="/auth/login";</script>`);    
            }
        }else{
            response.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
            document.location.href="/auth/login";</script>`); 
        }
    }
});

// 로그아웃
router.get('/logout', function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        request.session.destroy(function (err) {
            response.redirect('/');
        });
    }
});




router.get('/naverLogin', function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        response.render('auth_login_naver')
    }
});

 
// 회원가입 프로세스
router.post('/register_process', function(request, response) {  
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        if(request.session.type=='naver'){
            var Name = sanitizeHtml(request.session.nickname);
            var Password = sanitizeHtml(request.body.pwd);    
            var Platform_type  = sanitizeHtml('naver');
            var Password2 = sanitizeHtml(request.body.pwd2);
            var Phone_Number = sanitizeHtml(request.body.number);
            var Address = sanitizeHtml(request.body.address);
            var Email_Address = sanitizeHtml(request.session.email);
            var Recommand_ID = sanitizeHtml('');
            if(Address){
                db.query(`insert into Student(Platform_type ,Name, Phone_Number, 
                    Email_Address, Address, Date, Recommand_ID, Point) values
                    (?,?,?,?,?,?,?,
                    ?, ?)`,[Platform_type, Name,
                        Phone_Number,Email_Address,
                        Address,date_now,Recommand_ID,0],function(error, result){
                    if(error) throw error;
                    response.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                    document.location.href="/";</script>`);
                })
            }
            else{
                response.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다."); 
                document.location.href="/auth/register";</script>`);
            }
        }
        else if(request.session.type=='kakao'){
            console.log('kakao_register_in');
            console.log(request)
            var Name = sanitizeHtml(request.session.nickname);
            var Password = sanitizeHtml(request.body.pwd);    
            var Platform_type  = sanitizeHtml('');
            var Password2 = sanitizeHtml(request.body.pwd2);
            var Phone_Number = sanitizeHtml(request.body.number);
            var Address = sanitizeHtml(request.body.address);
            var Email_Address = sanitizeHtml(request.session.email);
            var Recommand_ID = sanitizeHtml('');
            if(Phone_Number && Address){
                db.query(`insert into Student(Platform_type ,Name, Phone_Number, 
                    Email_Address, Address, Date, Recommand_ID, Point) values
                    (?,?,?,?,?,?,?,
                    ?, ?)`,[request.session.type, Name,
                        Phone_Number, Email_Address,
                        Address,date_now,Recommand_ID,0],function(error, result){
                    if(error) throw error;
                    response.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                    document.location.href="/";</script>`);
                })
            }
            else{
                response.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다."); 
                document.location.href="/auth/register";</script>`);
            }
        }
        else{
            var Name = sanitizeHtml(request.body.username);
            var Password = sanitizeHtml(request.body.pwd);    
            var Password2 = sanitizeHtml(request.body.pwd2);
            var Phone_Number = sanitizeHtml(request.body.number);
            var Address_post = sanitizeHtml(request.body.member_post);
            var Address_addr = sanitizeHtml(request.body.member_addr);
            var Address_leftover = sanitizeHtml(request.body.member_leftover);
            var Email_Address = sanitizeHtml(request.body.EA);
            var Recommand_ID = sanitizeHtml(request.body.recommend_ID);
            var Point = sanitizeHtml(0);
            var Address = Address_addr + Address_leftover;
            if (Name && Password && Password2 && Phone_Number && Address_post && Address_addr && Email_Address && request.session.email_check && request.session.password_check) { //필수정보
                db.query(`SELECT * FROM Student WHERE Email_Address = ? or Phone_Number =?;
                          SELECT * FROM Student WHERE Email_Address = ?
                `, [Email_Address,Phone_Number,Recommand_ID], function(error1, results) { // DB에 같은 이름의 회원아이디가 있는지 확인
                    if (error1) throw error1;
                    console.log('results',results);
                    if (results[0].length <= 0 && Password == Password2) {     // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
                        bcrypt.hash(Password, saltRounds, function(err, hash){
                            if(err) throw err;   
                            if(Recommand_ID === ''){
                                db.query(`INSERT INTO Student (Platform_type , Name , Phone_Number ,
                                    Email_Address , Password, PostCode,Address , Date , Recommand_ID, Point) 
                                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                ['local', Name, Phone_Number, Email_Address, 
                                    hash,Address_post, Address, date_now, Recommand_ID, Point], function (error2, data) {
                                    if(error2) throw error2;
                                    response.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                                    document.location.href="/";</script>`);
                                })
                            }
                            else if(results[1].length>0 && Recommand_ID != Email_Address){
                                db.query(`INSERT INTO Student (Platform_type , Name , Phone_Number ,
                                    Email_Address , Password, PostCode,Address , Date , Recommand_ID, Point) 
                                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                ['local', Name, Phone_Number, Email_Address, 
                                    hash,Address_post, Address, date_now, Recommand_ID, Point], function (error2, data) {
                                    if(error2) throw error2;
                                    db.query(`update Student set Point = 5000 where Email_Address = ?;
                                                update Student set Point = Point + 5000 where Email_Address = ?;
                                    `,[Email_Address,Recommand_ID],(error3, recommand_result) => {
                                        if(error3) throw error3;
                                    })
                                    response.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                                    document.location.href="/";</script>`);
                                })
                            }
                            else{
                                response.send(`<script type="text/javascript">alert("추천인 아이디가 올바르지 않습니다.");
                                document.location.href="/auth/register";</script>`);
                            }
                           
                        })
                    }
                    else if (Password != Password2) {                     // 비밀번호가 올바르게 입력되지 않은 경우
                        response.send(`<script type="text/javascript">alert("입력된 비밀번호가 서로 다릅니다."); 
                        document.location.href="/auth/register";</script>`);    
                    } 
                    else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우
                        response.send(`<script type="text/javascript">alert("이미 존재하는 전화번호입니다."); 
                        document.location.href="/auth/register";</script>`);    
                    }    
                })
            }
            else if(request.session.email_check != 1){
                console.log("email_check value : ",request.session.email_check)
                response.send(`<script type="text/javascript">alert("이메일 인증을 하세요.");
                document.location.href="/auth/register";</script>`);
            }else if(request.session.password_check != 1){
                console.log("password_check value : ",request.session.password_check)
                response.send(`<script type="text/javascript">alert("패스워드 체크를 하세요.");
                document.location.href="/auth/register";</script>`);
            }
            else {        // 입력되지 않은 정보가 있는 경우
                response.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다."); 
                document.location.href="/auth/register";</script>`);
            }
        }
    }
});
module.exports = router;