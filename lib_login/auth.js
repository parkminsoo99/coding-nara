var express = require('express');
var router = express.Router();
var qs = require('querystring');
var log_template = require('./log_template.js');
var db = require('../db');
const axios = require('axios');
/*네이버 로그인 관련 변수*/
var client_id = 'sIwGUXdmGRyOPin4mTnj';
var client_secret = 'bWV7qU9Ngl';
var state = "1004";
var redirectURI = encodeURI("http://localhost:3000/auth/naver/login");
var api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state;
const request = require('request-promise');
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
    redirect_url : 'http://localhost:3000/auth/kakao/login',
    logout_redirect_url : 'http://localhost:3000/auth/kakao/logout'
}

// 로그인 화면
router.get('/login', function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        if(request.session.type == 'kakao') request.session.destroy();
        if(request.session.type == 'naver') request.session.destroy();
        var title = '로그인';
        var html = log_template.HTML(title,`
                <h2>로그인</h2>
                <form action="/auth/login_process" method="post">
                    <p><input class="login" type="text" name="Login_ID" placeholder="아이디"></p>
                    <p><input class="login" type="password" name="pwd" placeholder="비밀번호"></p>
                    <p><input class="btn" type="submit" value="로그인"></p>
                </form> 
                <!-- 카카오 로그인 버튼 노출 영역 -->
                <a id="kakao-login-btn" href="/auth/kakao/in">
                    <img src="https://k.kakaocdn.net/14/dn/btroDszwNrM/I6efHub1SN5KCJqLm1Ovx1/o.jpg" width="222"
                        alt="카카오 로그인 버튼" />
                </a>
                </br>
                <!-- 네이버 로그인 버튼 노출 영역 -->
                <a id="naver_id_login" href=${api_url}>
                    <img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/>
                </a>
                <p>계정이 없으신가요?  <a href="/auth/register">회원가입</a></p> 
            `, '');
        response.send(html);
    }
});

router.get('/naver/login', async (req, res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        platform_type = 'naver';
        console.log('platform_type : ',platform_type)
            // 토큰을 발급받으려면 query string으로 넘겨야 할 정보들이다.
        const code = req.query.code;
        const state = req.query.state;

            // 로그인 API를 사용해 access token을 발급받는다.
        const naver_api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
        + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
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
        console.log(info_result_json.email);

        db.query(`SELECT * FROM Student WHERE Email_Address = ?`, [info_result_json.email],
                function(error,results1){
                    console.log('result1',results1);
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
                        console.log('토큰!', token);
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
        const kakaoAuthroize = 'https://kauth.kakao.com/oauth/logout?client_id=f28ca6f29082d1991b42941c3178fe60&logout_redirect_uri=http://localhost:3000/'
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
// 회원가입 화면
router.get('/register', function(request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        if(request.session.type=='naver'){
            console.log('naver_register_in')
            var title = '회원가입';    
            var html = log_template.HTML(title, `
            <h2>회원가입</h2>
            <form action="/auth/register_process" method="post">
                <p><input class="login" type="text" name="Login_ID" placeholder="아이디"  value=${sanitizeHtml(request.session.email)} disabled></p>   
                <p><input class="login" type="text" name="username" placeholder="이름" value=${sanitizeHtml(request.session.nickname)} disabled></p>
                <p><input class="login" type="password" name="pwd" placeholder="비밀번호" disabled></p>    
                <p><input class="login" type="password" name="pwd2" placeholder="비밀번호 재확인" disabled></p>
                <p><input class="login" type="text" name="number" placeholder="전화번호" value=${sanitizeHtml(request.session.mobile)}></p>
                <p><input class="login" type="text" name="address" placeholder="주소" value="서울"></p>
                <p><input class="login" type="text" name="email" placeholder="이메일" value=${sanitizeHtml(request.session.email)} disabled></p>
                <p><input class="login" type="text" name="recommendID" placeholder="추천인ID" value=""></p>
                <p><input class="btn" type="submit" value="제출"></p>
            </form>            
            <p><a href="/auth/login">로그인화면으로 돌아가기</a></p>
            `, '');
            response.send(html);
        }
        else if(request.session.type=='kakao'){
            console.log('kakao_register_in')
            var title = '회원가입';    
            var html = log_template.HTML(title, `
            <h2>회원가입</h2>
            <form action="/auth/register_process" method="post">
                <p><input class="login" type="text" name="Login_ID" placeholder="아이디"  value=${sanitizeHtml(request.session.email)} disabled></p>   
                <p><input class="login" type="text" name="username" placeholder="이름" value=${sanitizeHtml(request.session.nickname)} disabled></p>
                <p><input class="login" type="password" name="pwd" placeholder="비밀번호" disabled></p>    
                <p><input class="login" type="password" name="pwd2" placeholder="비밀번호 재확인" disabled></p>
                <p><input class="login" type="text" name="number" placeholder="전화번호" value="010-1111-1111"></p>
                <p><input class="login" type="text" name="address" placeholder="주소" value="서울"></p>
                <p><input class="login" type="text" name="email" placeholder="이메일" value=${sanitizeHtml(request.session.email)} disabled></p>
                <p><input class="login" type="text" name="recommendID" placeholder="추천인ID" value=""></p>
                <p><input class="btn" type="submit" value="제출"></p>
            </form>            
            <p><a href="/auth/login">로그인화면으로 돌아가기</a></p>
            `, '');
            response.send(html);
        }
        else{
            var title = '회원가입';    
            var html = log_template.HTML(title, `
            <h2>회원가입</h2>
            <form action="/auth/register_process" method="post">
                <p><input class="login" type="text" name="Login_ID" placeholder="아이디"  value="test"></p>   
                <p><input class="login" type="text" name="username" placeholder="이름" value="장영재" ></p>
                <p><input class="login" type="password" name="pwd" placeholder="비밀번호" value="11"></p>    
                <p><input class="login" type="password" name="pwd2" placeholder="비밀번호 재확인" value="11"></p>
                <p><input class="login" type="text" name="number" placeholder="전화번호" value="010-1111-1111"></p>
                <p><input class="login" type="text" name="address" placeholder="주소" value="서울"></p>
                <p><input class="login" type="text" name="email" placeholder="이메일" value="test@naver.com" ></p>
                <p><input class="login" type="text" name="recommendID" placeholder="추천인ID" value=""></p>
                <p><input class="btn" type="submit" value="제출"></p>
            </form>            
            <p><a href="/auth/login">로그인화면으로 돌아가기</a></p>
            `, '');
            response.send(html);
        }
    }
});

router.post('/login_process', function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var Login_ID = request.body.Login_ID;
        var password = request.body.pwd;
        var sanitizeHtml_Login_ID = sanitizeHtml(Login_ID);
        var sanitizeHtml_password = sanitizeHtml(password);
        if(sanitizeHtml_Login_ID != '' && sanitizeHtml_password != '' ){
            if (Login_ID && password) {             // id와 pw가 입력되었는지 확인
                db.query('SELECT * FROM Student WHERE Login_ID = ?', [Login_ID], function(error, results, fields) {
                    if (error) throw error;
                    if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                        bcrypt.compare(password,results[0].Password, function(err, result){
                            if(result){
                                console.log(results[0].Email_Address);
                                request.session.is_logined = true;      // 세션 정보 갱신
                                request.session.nickname = Login_ID;
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
        var title = '로그인';
        var html = log_template.HTML(title,
            `
            <body>
            <script type="text/javascript">
            var naver_id_login = new naver_id_login("sIwGUXdmGRyOPin4mTnj", "http://localhost:3000/auth/naverLogin");
            // 접근 토큰 값 출력
            alert(naver_id_login.oauthParams.access_token);
            // 네이버 사용자 프로필 조회
            naver_id_login.get_naver_userprofile("naverSignInCallback()");
            // 네이버 사용자 프로필 조회 이후 프로필 정보를 처리할 callback function
            function naverSignInCallback() {
                alert(naver_id_login.getProfileData());
                alert(naver_id_login.getProfileData('email'));
                alert(naver_id_login.getProfileData('nickname'));
                alert(naver_id_login.getProfileData('age'));
            }
            </script>
            `, '');
        response.send(html);
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
            var Login_ID = sanitizeHtml(request.body.Login_ID);
            var Name = sanitizeHtml(request.body.username);
            var Password = sanitizeHtml(request.body.pwd);    
            var Platform_type  = sanitizeHtml('');
            var Password2 = sanitizeHtml(request.body.pwd2);
            var Phone_Number = sanitizeHtml(request.body.number);
            var Address = sanitizeHtml(request.body.address);
            var Email_Address = sanitizeHtml(request.body.email);
            var Recommand_ID = sanitizeHtml(0);
            var Point = sanitizeHtml(0);
            if(Address){
                db.query(`insert into Student(Platform_type ,Name, Phone_Number, 
                    Email_Address, Login_ID, Address, Date, Recommand_ID, Point) values
                    (?,?,?,?,?,?,now(),
                    ?, 0)`,[request.session.type,request.session.nickname,
                        request.session.mobile,request.session.email,
                        request.session.email,Address,Recommand_ID],function(error, result){
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
            var Login_ID = sanitizeHtml(request.body.Login_ID);
            var Name = sanitizeHtml(request.body.username);
            var Password = sanitizeHtml(request.body.pwd);    
            var Platform_type  = sanitizeHtml('');
            var Password2 = sanitizeHtml(request.body.pwd2);
            var Phone_Number = sanitizeHtml(request.body.number);
            var Address = sanitizeHtml(request.body.address);
            var Email_Address = sanitizeHtml(request.body.email);
            var Recommand_ID = sanitizeHtml(0);
            var Point = sanitizeHtml(0);
            if(Phone_Number && Address){
                db.query(`insert into Student(Platform_type ,Name, Phone_Number, 
                    Email_Address, Login_ID, Address, Date, Recommand_ID, Point) values
                    (?,?,?,?,?,?,now(),
                    ?, 0)`,[request.session.type,request.session.nickname,
                        Phone_Number,request.session.email,
                        request.session.email,Address,Recommand_ID],function(error, result){
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
            var Login_ID = sanitizeHtml(request.body.Login_ID);
            var Name = sanitizeHtml(request.body.username);
            var Password = sanitizeHtml(request.body.pwd);    
            var Platform_type  = sanitizeHtml('');
            var Password2 = sanitizeHtml(request.body.pwd2);
            var Phone_Number = sanitizeHtml(request.body.number);
            var Address = sanitizeHtml(request.body.address);
            var Email_Address = sanitizeHtml(request.body.email);
            var Recommand_ID = sanitizeHtml(0);
            var Point = sanitizeHtml(0);
            if (Login_ID &&Name && Password && Password2 && Phone_Number && Address && Email_Address ) { //필수정보
                db.query('SELECT * FROM student WHERE Login_ID = ?', [Login_ID], function(error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
                    console.log(results);
                    if (error) throw error;
                    if (results.length <= 0 && Password == Password2) {     // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
                        db.query('SELECT * FROM student WHERE recommendID = ?', [Recommand_ID], function(error, results_ID, fields){
                        
                    }) 
                    bcrypt.hash(Password, saltRounds, function(err, hash){
                        if(err) throw err;
                        db.query('INSERT INTO Student (Platform_type , Name , Phone_Number , Email_Address , Login_ID , Password , Address , Date , Recommand_ID, Point ) VALUES(?, ?, ?, ?, ?, ?, ?, now(), ?, ?)', [Platform_type, Name, Phone_Number, Email_Address, Login_ID, hash, Address, Recommand_ID, Point], function (error, data) {
                            if (error) throw error;
                            response.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                            document.location.href="/";</script>`);
                        });
                    })
                    } else if (Password != Password2) {                     // 비밀번호가 올바르게 입력되지 않은 경우
                        response.send(`<script type="text/javascript">alert("입력된 비밀번호가 서로 다릅니다."); 
                        document.location.href="/auth/register";</script>`);    
                    }
                    else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우
                        response.send(`<script type="text/javascript">alert("이미 존재하는 아이디 입니다."); 
                        document.location.href="/auth/register";</script>`);    
                    }            
                });
            } else {        // 입력되지 않은 정보가 있는 경우
                response.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다."); 
                document.location.href="/auth/register";</script>`);
            }
        }
    }
});
module.exports = router;