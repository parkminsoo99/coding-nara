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
var authCheck = require('../lib_login/authCheck.js');
require("dotenv").config();
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

// 로그인 화면
router.get('/login', function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        if(request.session.type == 'kakao') request.session.destroy();
        else if(request.session.type == 'naver') request.session.destroy();
        response.render('./auth/auth_login_main',{
            API_URL : api_url,
            authCheck : authCheck.statusUI(request, response),
        })
    }
});

// 회원가입 화면
router.get('/register', async(request, response) =>{
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }
    else{
        if(request.session.type=='naver'){
            response.render('./auth/auth_register_naver',{
                Email : sanitizeHtml(request.session.email),
                Nickname : sanitizeHtml(request.session.nickname),
                Mobile : sanitizeHtml(request.session.mobile),
            });
        }
        else if(request.session.type=='kakao'){
            response.render('./auth/auth_register_kakao',{
                Email : sanitizeHtml(request.session.email),
                Nickname : sanitizeHtml(request.session.nickname)
            });
        }
        else{
            request.session.destroy();
            response.render('./auth/auth_register_main',{
                Authnum : sanitizeHtml(authNum),
                Email_Status : sanitizeHtml(Email_status),
            });
        }      
    }
});

router.post('/login_process', function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Email_Address = sanitizeHtml(request.body.Email_Address);
        var password = sanitizeHtml(request.body.pwd);
        var sanitizeHtml_Email_Address = sanitizeHtml(Email_Address);
        var sanitizeHtml_password = sanitizeHtml(password);
        if(sanitizeHtml_Email_Address  != '' && sanitizeHtml_password != '' ){
            if (sanitizeHtml_Email_Address && sanitizeHtml_password) {             // id와 pw가 입력되었는지 확인
                db.query('SELECT * FROM Student WHERE Email_Address = ?;', [sanitizeHtml_Email_Address], function(error, results, fields) {
                    if (error) throw error;
                    if (results.length > 0 && results[0].Platform_type === 'local') {       // db에서의 반환값이 있으면 로그인 성공
                        bcrypt.compare(password,results[0].Password, function(err, result){
                            if(result){
                                request.session.is_logined = true;      // 세션 정보 갱신
                                request.session.email = results[0].Email_Address
                                request.session.mobile = results[0].Phone_Number
                                request.session.nickname = results[0].Name;
                                request.session.Student_Id = results[0].Student_ID;
                                request.session.save(function () {
                                response.redirect(`/`);
                            }); 
                            }else{
                                response.send(`<script type="text/javascript">alert("계정이 존재하지 않거나 로컬 사용자가 아닙니다."); 
                                document.location.href="/auth/login";</script>`);    
                            }
                        })
                    } else {              
                        response.send(`<script type="text/javascript">alert("계정이 존재하지 않거나 로컬 사용자가 아닙니다."); 
                        document.location.href="/auth/login";</script>`);    
                    }           
                })
            } 
            else {
                response.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
                document.location.href="/auth/login";</script>`);    
            }
        }else{
            response.send(`<script type="text/javascript">alert("계정이 존재하지 않거나 로컬 사용자가 아닙니다."); 
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
            var Password2 = sanitizeHtml(request.body.pwd2);
            var type = sanitizeHtml(request.session.type);
            var Phone_Number = sanitizeHtml(request.session.mobile);
            var Email_Address = sanitizeHtml(request.session.email);
            var Address_post = sanitizeHtml(request.body.member_post);
            var Address_addr = sanitizeHtml(request.body.member_addr);
            var Address_leftover = sanitizeHtml(request.body.member_leftover);
            var Recommand_ID = sanitizeHtml(request.body.recommend_ID);
            var Address = Address_addr +' '+ Address_leftover;
            var Point = sanitizeHtml(0);
            if(Address_post && Address_addr){
                db.query(`SELECT * FROM Student WHERE Email_Address = ? or Phone_Number =?;
                            SELECT * FROM Student WHERE Email_Address = ?
                `, [Email_Address,Phone_Number,Recommand_ID], function(error1, results) { // DB에 같은 이름의 회원아이디가 있는지 확인
                    if (error1) throw error1;
                    if (results[0].length <= 0) {     // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
                        bcrypt.hash(Password, saltRounds, function(err, hash){
                            if(err) throw err;   
                            if(Recommand_ID === ''){
                                db.query(`INSERT INTO Student (Platform_type , Name , Phone_Number ,
                                    Email_Address , Password, PostCode, Address , Date , Recommand_ID, Point) 
                                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                [type, Name, Phone_Number, Email_Address, 
                                    hash, Address_post, Address, date_now, Recommand_ID, Point], function (error2, data) {
                                    if(error2) throw error2;
                                    response.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                                    document.location.href="/";</script>`);
                                })
                            }
                            else if(results[1].length>0 && Recommand_ID != Email_Address){
                                db.query(`INSERT INTO Student (Platform_type , Name , Phone_Number ,
                                    Email_Address , Password, PostCode,Address , Date , Recommand_ID, Point) 
                                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                [type, Name, Phone_Number, Email_Address, 
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
                    else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우
                        response.send(`<script type="text/javascript">alert("이미 존재하는 회원입니다."); 
                        document.location.href="/auth/login";</script>`);    
                    }    
                })
            }
            else {        // 입력되지 않은 정보가 있는 경우
                response.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다."); 
                document.location.href="/auth/register";</script>`);
            }
        }
        else if(request.session.type=='kakao'){
            var Name = sanitizeHtml(request.session.nickname);
            var Password = sanitizeHtml(request.body.pwd);    
            var Password2 = sanitizeHtml(request.body.pwd2);
            var Phone_Number = sanitizeHtml(request.body.number);
            var type = sanitizeHtml(request.session.type);
            var Address_post = sanitizeHtml(request.body.member_post);
            var Address_addr = sanitizeHtml(request.body.member_addr);
            var Address_leftover = sanitizeHtml(request.body.member_leftover);
            var Email_Address = sanitizeHtml(request.session.email);
            var Recommand_ID = sanitizeHtml(request.body.recommend_ID);
            var Point = sanitizeHtml(0);
            var Address = Address_addr +' '+ Address_leftover;
            if(Phone_Number && Address_post && Address_addr){
                db.query(`SELECT * FROM Student WHERE Email_Address = ? or Phone_Number =?;
                            SELECT * FROM Student WHERE Email_Address = ?
                `, [Email_Address,Phone_Number,Recommand_ID], function(error1, results) { // DB에 같은 이름의 회원아이디가 있는지 확인
                    if (error1) throw error1;
                    if (results[0].length <= 0) {     // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
                        bcrypt.hash(Password, saltRounds, function(err, hash){
                            if(err) throw err;   
                            if(Recommand_ID === ''){
                                db.query(`INSERT INTO Student (Platform_type , Name , Phone_Number ,
                                    Email_Address , Password, PostCode, Address , Date , Recommand_ID, Point) 
                                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                [type, Name, Phone_Number, Email_Address, 
                                    hash, Address_post, Address, date_now, Recommand_ID, Point], function (error2, data) {
                                    if(error2) throw error2;
                                    response.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                                    document.location.href="/";</script>`);
                                })
                            }
                            else if(results[1].length>0 && Recommand_ID != Email_Address){
                                db.query(`INSERT INTO Student (Platform_type , Name , Phone_Number ,
                                    Email_Address , Password, PostCode,Address , Date , Recommand_ID, Point) 
                                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                                [type, Name, Phone_Number, Email_Address, 
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
                    else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우
                        response.send(`<script type="text/javascript">alert("이미 존재하는 회원입니다."); 
                        document.location.href="/auth/login";</script>`);    
                    }    
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
            var Address = Address_addr +' '+ Address_leftover;
            if (Name && Password && Password2 && Phone_Number && Address_post && Address_addr && Email_Address && request.session.email_check && request.session.password_check) { //필수정보
                db.query(`SELECT * FROM Student WHERE Email_Address = ? or Phone_Number =?;
                          SELECT * FROM Student WHERE Email_Address = ?
                `, [Email_Address,Phone_Number,Recommand_ID], function(error1, results) { // DB에 같은 이름의 회원아이디가 있는지 확인
                    if (error1) throw error1;
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
                        response.send(`<script type="text/javascript">alert("이미 존재하는 회원입니다."); 
                        document.location.href="/auth/login";</script>`);    
                    }    
                })
            }
            else if(request.session.email_check != 1){
                response.send(`<script type="text/javascript">alert("이메일 인증을 하세요.");
                document.location.href="/auth/register";</script>`);
            }else if(request.session.password_check != 1){
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


//find_Id && find_Passwrd

router.get('/find_ID', (request,response)=>{
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        response.render('./auth/auth_find_id',{
            authCheck : authCheck.statusUI(request, response),
        })
    }
})
router.post('/find_id_process', (request, response) => {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var username = sanitizeHtml(request.body.username)
        var number = sanitizeHtml(request.body.number)
        db.query('select * from Student where Name = ? and Phone_Number = ?',[username,  number], (error1,result)=>{
            if(error1) throw error1;
            if(result.length > 0 && result[0].Platform_type == 'local'){
                response.render('./auth/auth_find_id_success',{
                    authCheck : authCheck.statusUI(request, response),
                    Email_Address : result[0].Email_Address,
                });
            }else{
                response.send(`<script type="text/javascript">alert("계정이 존재하지 않거나 로컬 사용자가 아닙니다."); 
                document.location.href="/auth/find_ID";</script>`);
            }
        })
    }
})
router.get('/find_PW', (request, response) => {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        response.render('./auth/auth_find_password',{
            authCheck : authCheck.statusUI(request, response),
        });
    }
})
router.post('/find_pw_process', (request,response) => {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var username = sanitizeHtml(request.body.username)
        var Email_Address = sanitizeHtml(request.body.EA)
        db.query(`select * from Student where Name = ? and Email_Address = ?`,[username, Email_Address], (error1, result)=>{
            if(error1) throw error1;
            if(result.length > 0 && result[0].Platform_type == 'local'){
                if(request.session.email_check == 1){
                    request.session.username = username
                    request.session.Email_Address = Email_Address
                    response.render('./auth/auth_change_password',{
                        authCheck : authCheck.statusUI(request, response),
                    });
                }else{
                    response.send(`<script type="text/javascript">alert("이메일 인증을 해주세요."); 
                document.location.href="/auth/find_PW";</script>`);
                }
            }else{
                response.send(`<script type="text/javascript">alert("계정이 존재하지 않거나 로컬 사용자가 아닙니다."); 
                document.location.href="/auth/find_PW";</script>`);
            }
        })
    }
})


router.post('/password_change_process', (request,response) => {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Password = sanitizeHtml(request.body.pwd);    
        var Password2 = sanitizeHtml(request.body.pwd2);
        if (Password == Password2 && request.session.password_check == 1) {     // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
            bcrypt.hash(Password, saltRounds, function(err, hash){
                if(err) throw err;   
                    db.query(`update Student set Password = ? where Name = ? and Email_Address = ?`, 
                    [hash, request.session.username, request.session.Email_Address], 
                        function (error2, data) {
                        if(error2) throw error2;
                        response.send(`<script type="text/javascript">alert("비밀번호 변경이 완료되었습니다!");
                        document.location.href="/auth/login";</script>`);
                    })
                })
            }
    }
})
router.post('/password_mail', (req, res) => {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        const reademailaddress = sanitizeHtml(req.body.EA);
        let emailTemplete;
        db.query(`select * from Student where Email_Address = ?`,[reademailaddress], async(error, result) => {
            if(error) throw error;
            else{
                if(result.length <= 0) res.send({ result : 'not_exist' })
                else{
                    const authNum = Math.random().toString().substr(2,6);
                    const hashAuth = await bcrypt.hash(authNum, 12);
                    req.session.hashAuth = hashAuth;
                    res.render('./auth/password_mail', {authCode : authNum}, function (err, data) {
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
                            user: process.env.NODEMAILER_USER,
                            pass: process.env.NODEMAILER_PASS,
                        },tls: {
                            rejectUnauthorized: false
                        }
                    });
                    const mailOptions = await transporter.sendMail({
                        from: `admin@coding-nara.com`,
                        to: 'zzangorc99@naver.com',
                        subject: '비밀번호 변경을 위한 인증번호를 입력해주세요.',
                        html: emailTemplete,
                    });
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        }else{
                            res.send(authNum);
                            transporter.close()
                        }
                    });
                    return res.send({ result : 'send', HashAuth : req.session.hashAuth});
                }
            }
        })
    }
});

//mail & password_check

router.post('/mail', (req, res) => {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        const reademailaddress =  sanitizeHtml(req.body.EA);
        let emailTemplete;
        db.query(`select * from Student where Email_Address = ?`,[reademailaddress], async(error, result) => {
            if(error) throw error;
            else{
                if(result.length>0) res.send({ result : 'exist' })
                else{
                    let authNum = Math.random().toString().substr(2,6);
                    const hashAuth = await bcrypt.hash(authNum, 12);
                    req.session.hashAuth = hashAuth;
                    res.render('./auth/mail', {authCode : authNum}, function (err, data) {
                    if(err){console.log(err)}
                    emailTemplete = data;
                    });
                    let transporter = await nodemailer.createTransport({
                        service: 'daum',
                        host: 'smtp.daum.net',
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.NODEMAILER_USER,
                            pass: process.env.NODEMAILER_PASS,
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
                            res.send(authNum);
                            transporter.close()
                        }
                    });
                    return res.send({ result : 'send', HashAuth : req.session.hashAuth});
                }
            }
        })
    }
});

router.post('/mail_expire', (req,res) => {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        req.session.destroy(function(){ 
            req.session;
        });
    }
})
router.post('/password_check_success', (req,res) => {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        req.session.password_check = 1;
        res.send();
    }
})
router.post('/mail_validation', async (req, res, next) => {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        try {
            if(!req.session.hashAuth) res.send({ result : 'expire'});
            else if(bcrypt.compareSync(req.body.CEA, req.session.hashAuth)) {
                req.session.email_check = 1;
                res.send({ result : 'success'});
            }
            else res.send({ result : 'fail'});
        } catch(err) {
        res.send({ result : 'fail'});
        next(err);
        }
    }
});

//-------naver

router.get('/naver/login', async (req, res) => {
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
        
        db.query(`SELECT * FROM Student WHERE Email_Address = ?`, [sanitizeHtml(info_result_json.email)],
                function(error,results1){
                    if(error) throw error;
                    if (results1.length > 0 && results1[0].Platform_type === 'naver') {       // db에서의 반환값이 있으면 로그인 성공
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

router.get('/naverLogin', function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        response.render('./auth/auth_login_naver',{
            authCheck : authCheck.statusUI(request, response),
        })
    }
});

//-----kakao

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
                if(error) throw error;
                if (results1.length > 0 && results1[0].Platform_type === 'kakao') {       // db에서의 반환값이 있으면 로그인 성공
                    req.session.type = platform_type;
                    req.session.email = email;
                    req.session.is_logined = true;      // 세션 정보 갱신
                    req.session.nickname = nickname;
                    req.session.save(function () {
                        res.redirect(`/`);
                    });
                }
                else{
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
            res.redirect('/');
        }
    }
})
module.exports = router;