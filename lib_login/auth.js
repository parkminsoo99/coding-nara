var express = require('express');
var router = express.Router();

var log_template = require('./log_template.js');
var db = require('../db');

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
            <ul>
	<li>
      <!-- 아래와같이 아이디를 꼭 써준다. -->
      <a id="naverIdLogin_loginButton" href="javascript:void(0)">
          <span>네이버 로그인</span>
      </a>
	</li>
	<li onclick="naverLogout(); return false;">
      <a href="javascript:void(0)">
          <span>네이버 로그아웃</span>
      </a>
	</li>
</ul>

<!-- 네이버 스크립트 -->
<script src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js" charset="utf-8"></script>

<script>

var naverLogin = new naver.LoginWithNaverId(
		{
			clientId: "YOw2QsbgiQMXkMDVZmv_", //내 애플리케이션 정보에 cliendId를 입력해줍니다.
			callbackUrl: "http://localhost:3000", // 내 애플리케이션 API설정의 Callback URL 을 입력해줍니다.
			isPopup: false,
			callbackHandle: true
		}
	);	

naverLogin.init();

window.addEventListener('load', function () {
	naverLogin.getLoginStatus(function (status) {
		if (status) {
			var email = naverLogin.user.getEmail(); // 필수로 설정할것을 받아와 아래처럼 조건문을 줍니다.
    		
			console.log(naverLogin.user); 
    		
            if( email == undefined || email == null) {
				alert("이메일은 필수정보입니다. 정보제공을 동의해주세요.");
				naverLogin.reprompt();
				return;
			}
		} else {
			console.log("callback 처리에 실패하였습니다.");
		}
	});
});


var testPopUp;
function openPopUp() {
    testPopUp= window.open("https://nid.naver.com/nidlogin.logout", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,width=1,height=1");
}
function closePopUp(){
    testPopUp.close();
}

function naverLogout() {
	openPopUp();
	setTimeout(function() {
		closePopUp();
		}, 1000);
	
	
}
</script> 
<ul>
	<li onclick="kakaoLogin();">
      <a href="javascript:void(0)">
          <span>카카오 로그인</span>
      </a>
	</li>
	<li onclick="kakaoLogout();">
      <a href="javascript:void(0)">
          <span>카카오 로그아웃</span>
      </a>
	</li>
</ul>
<!-- 카카오 스크립트 -->
<script src="https://developers.kakao.com/sdk/js/kakao.js"></script>
<script>
Kakao.init('6a78718988e7f6b814f7ab1a60c4e12a'); //발급받은 키 중 javascript키를 사용해준다.
console.log(Kakao.isInitialized()); // sdk초기화여부판단
//카카오로그인
function kakaoLogin() {
    Kakao.Auth.login({
      success: function (response) {
        Kakao.API.request({
          url: '/v2/user/me',
          success: function (response) {
        	  console.log(response)
          },
          fail: function (error) {
            console.log(error)
          },
        })
      },
      fail: function (error) {
        console.log(error)
      },
    })
  }
//카카오로그아웃  
function kakaoLogout() {
    if (Kakao.Auth.getAccessToken()) {
      Kakao.API.request({
        url: '/v1/user/unlink',
        success: function (response) {
        	console.log(response)
        },
        fail: function (error) {
          console.log(error)
        },
      })
      Kakao.Auth.setAccessToken(undefined)
    }
  }  
</script>          
            <p>계정이 없으신가요?  <a href="/auth/register">회원가입</a></p> 
        `, '');
    response.send(html);
});

// 로그인 프로세스
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
                db.query('SELECT * FROM student WHERE Login_ID = ?', [Recommand_ID], function(error, results_ID, fields){
                if(results_ID.length>=0){
                    Recommand_ID=1;
                    Point=500;
                }
             
                db.query('INSERT INTO Student (Platform_type , Name , Phone_Number , Email_Address , Login_ID , Password , Address , Date , Recommand_ID, Point ) VALUES(?, ?, ?, ?, ?, ?, ?, now(), ?, ?)', [Platform_type, Name, Phone_Number, Email_Address, Login_ID, Password, Address, Recommand_ID, Point], function (error, data) {
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
});

module.exports = router;