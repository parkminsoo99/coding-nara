var express = require('express');
var router = express.Router();
var qs = require('querystring');
var log_template = require('./log_template.js');
var db = require('../db');
const axios = require('axios');

// 로그인 화면
router.get('/login', function (request, response) {
    var title = '로그인';
    var html = log_template.HTML(title,`
            <h2>로그인</h2>
            <form action="/auth/login_process" method="post">
                <p><input class="login" type="text" name="Login_ID" placeholder="아이디"></p>
                <p><input class="login" type="password" name="pwd" placeholder="비밀번호"></p>
                <p><input class="btn" type="submit" value="로그인"></p>
            </form> 
            <!-- 카카오 로그인 버튼 노출 영역 -->

            <a id="kakao-login-btn" href="/auth/kakao/login">
                <img src="https://k.kakaocdn.net/14/dn/btroDszwNrM/I6efHub1SN5KCJqLm1Ovx1/o.jpg" width="222"
                     alt="카카오 로그인 버튼" />
            </a>

            <!-- 네이버 로그인 버튼 노출 영역 -->
            
            <div id="naver_id_login"></div>
            <!-- //네이버 로그인 버튼 노출 영역 -->
            <script type="text/javascript">
                var naver_id_login = new naver_id_login("sIwGUXdmGRyOPin4mTnj", "http://localhost:3000/auth/naverLogin");
                var state = naver_id_login.getUniqState();
                naver_id_login.setButton("white", 2,40);
                naver_id_login.setDomain("YOUR_SERVICE_URL");
                naver_id_login.setState(state);
                naver_id_login.setPopup();
                naver_id_login.init_naver_id_login();
            </script>          
            <p>계정이 없으신가요?  <a href="/auth/register">회원가입</a></p> 
        `, '');
    response.send(html);
});
const kakaoData = {
    client_id : 'f28ca6f29082d1991b42941c3178fe60',
    client_secret : 'fOdmb6jteLfVhsfoWVvqm4Us5CgRc6DS',
    redirect_url : 'http://localhost:3000/auth/kakao'
}

router.get('/kakao/login',(req,res) => {
    const kakaoAuthroize = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoData.client_id}&redirect_uri=${kakaoData.redirect_url}`
    console.log('inin');
    res.redirect(kakaoAuthroize);
})

router.get('/kakao', async(req, res) => {
    try{
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
        const { nickname, profile_image} = user.data.properties
        console.log('토큰!', token);
        console.log('사용자 정보',nickname,profile_image);
        res.redirect('/');
    }catch{
        console.log('실패!');
    }
})

router.get('/naverLogin', function (request, response) {
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
});
router.post('/login_process', function (request, response) {
    var Login_ID = request.body.Login_ID;
    var Student_ID= request.body.Login_ID;
    var password = request.body.pwd;
    if (Login_ID && password) {             // id와 pw가 입력되었는지 확인
        
        db.query('SELECT * FROM Student WHERE Login_ID = ? AND password = ?', [Login_ID, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                request.session.is_logined = true;      // 세션 정보 갱신
                request.session.nickname = Login_ID;
                request.session.Student_Id = Student_ID;
                request.session.save(function () {
                    response.redirect(`/`);
                });
            } else {              
                response.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                document.location.href="/auth/login";</script>`);    
            }            
        });

    } else {
        response.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
        document.location.href="/auth/login";</script>`);    
    }
});

// 로그아웃
router.get('/logout', function (request, response) {
    request.session.destroy(function (err) {
        response.redirect('/');
    });
});


// 회원가입 화면
router.get('/register', function(request, response) {
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
});
 
// 회원가입 프로세스
router.post('/register_process', function(request, response) {    
    var Login_ID = request.body.Login_ID
    var Name = request.body.username;
    var Password = request.body.pwd;    
    var Platform_type  = '';
    var Password2 = request.body.pwd2;
    var Phone_Number = request.body.number;
    var Address = request.body.address;
    var Email_Address = request.body.email;
    var Recommand_ID = 0;
    var Point = 0;

    if (Login_ID &&Name && Password && Password2 && Phone_Number && Address && Email_Address ) { //필수정보
        db.query('SELECT * FROM student WHERE Login_ID = ?', [Login_ID], function(error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
            console.log(results);
            if (error) throw error;
            if (results.length <= 0 && Password == Password2) {     // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
<<<<<<< HEAD
                db.query('SELECT * FROM student WHERE Login_ID = ?', [Recommand_ID], function(error, results_ID, fields){
                if(results_ID.length>=0){
                    Recommand_ID=1;
                    Point=500;
                }
             
=======
                db.query('SELECT * FROM student WHERE recommendID = ?', [Recommand_ID], function(error, results_ID, fields){
                
            }) 
>>>>>>> 0f35e68d (수강신청에 필요한 UI제작 및 디비에서 강사 정보+강의 시간등의 필요한 정보를 가져옴)
                db.query('INSERT INTO Student (Platform_type , Name , Phone_Number , Email_Address , Login_ID , Password , Address , Date , Recommand_ID, Point ) VALUES(?, ?, ?, ?, ?, ?, ?, now(), ?, ?)', [Platform_type, Name, Phone_Number, Email_Address, Login_ID, Password, Address, Recommand_ID, Point], function (error, data) {
                    if (error) throw error;
                    response.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                    document.location.href="/";</script>`);
                });
<<<<<<< HEAD
            })
=======
>>>>>>> 0f35e68d (수강신청에 필요한 UI제작 및 디비에서 강사 정보+강의 시간등의 필요한 정보를 가져옴)
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
});

module.exports = router;