var express = require('express');
var router = express.Router();
var template_main = require('../lib_login/template.js');
var authCheck = require('../lib_login/authCheck.js');


router.get('/', (req, res) => {
    console.log('main_req :',req.session.type);
    // if(req.session.type = "kakao"){
    //   console.log('kakao_in')
    //   var html = template_main.HTML('Welcome',
    //   `<hr>
    //       <h2>메인 페이지에 오신 것을 환영합니다</h2>
    //       `,   
    //   authCheck.kakao_statusUI(req, res)
    //   );
    //   res.send(html);
    // }
    var html = template_main.HTML('Welcome',
      `
      <div align=center>
      <div id="logo"></div>
      <p id="title"><h1>실시간 온라인<h2></p>
      <p id="title"><h1>코딩교육을 한곳에서</h1></p>
      <li><a href="#"><ion-icon name="logo-instagram"></ion-icon></a></li>

      <br>
      <p><h3>우리 아이에 적합한 교육 서비스를 경험해보세요<h3></p>
      <br>
      <button class="button-arounder"><a href="/curriculum">시작하기</a></button>
      <br><br>
      <p><h1>코딩나라가 제공하는 서비스<h2></p><p><h1></h1></p>
      <br>
      <div class="container" id="borderDemo">
          <br>
          <h1>처음 접하는 아이들에게 맞춤교육</h1>
          <br><br>
        <div id="bg2" >
        </div>
        <h2 id="mg">코딩의 첫걸음을 쉽게 이끌어주도록 도와줍니다</h2>
        </div>
      </div>
      <br><br><br>
      <div align=center>
      <h1><코딩나라의 특징></h1>
      </div>
      <br/>
        <h2 id="mg">노트북만 있으면 언제 어디서든</h2>
      <div align="right">
      <p><h1>1대1로 실시간으로 문제 해결</h1></p>
      </div>
      <div align="center">
      <p><h1>&nbsp;&nbsp;원하는 시간을 선택</h1></p>
      </div>
      <div align="left">
      <p><h1>&nbsp;&nbsp;IT전공인 강사들에게</h1></p>
      </div>
      <div align="right">
        <h2 id="mg">처음 접하는 아이들에게 맞춤교육</h2>
      </div>
      <div align="left">
      <br>
      <br>
      <div style="width:300px; height:250px; border:1px solid black; float:left; margin-right:40px; margin-left:40px; border-radius: 30px; text-align: center;">
      <p><h1>처음 접하는<br>아이들에게 맞춤교육</h1></p>
      <br>
      <h3>저희는 처음 접하는 아이들에게 맞춰서<br>커리큘럼을 따로 맞추었으며<br>천천히 아이의 이해와 함께 진행하도록 하고 있습니다.</h3>
      </div>
      <div style="width:300px; height:250px; border:1px solid black; float:left; margin-right:40px; border-radius: 30px; text-align: center;">
      <p><h1>노트북만<br> 있으면 언제 어디서든</h1></p>
      <br>
      <h3>저희 코딩나라는 PC, 태블릿, 노트북으로 접속만 하면<br> 자체 내장된 프로그램을 통해 바로 수업을 들을 수 있습니다. </h3>
      </div>
      <div style="width:300px; height:250px; border:1px solid black; float:left; margin-right:40px; border-radius: 30px; text-align: center;">
      <p><h1>1대1로 <br>실시간으로 문제 해결</h1></p>
      <br>
      <h3>수업방식은 과외와 똑같은 방식을 고수하고 있으며<br>학생 개개인에 초점을 두어<br>실력 향상을 목표로 두고 있습니다.</h3>
      </div>
      <div style="width:300px; height:250px; border:1px solid black; float:left; margin-right:40px; border-radius: 30px; text-align: center;">
      <p><h1>원하는 <br>시간을 선택</h1></p>
      <br>
      <h3>아침 7시부터 24시까지<br>수업은 운영되고 있으며<br>스케줄에 맞춰서 원하는 시간에 수업을 들을 수 있습니다.</h3>
      </div>
      </div>
      <br><br><br><br><br><br><br><br>
      <div class="father">
      <div class="child1">
        <h1 class="lotaion">What is Coding?</h1>
      </div>
      <div class="child2">
         <h1>C언어, 파이썬 등 프로그래밍 언어를 이용해 컴퓨터 프로그램을 구현하는 기술</h1>
      </div>
    </div>
    <h2 id="mg"></h2>
    <div align="center">
    <p><h1>유명인들이 말하는 코딩의 중요성</h1></p>
    <br />
      </div>
    <blockquote>
  <p>모든 사람들은 코딩을 배워야합니다. 코딩은 '생각하는 법'을 가르쳐 줍니다</p>
  <cite>&mdash; 스티브 잡스 전 애플 CEO</cite>
</blockquote>
<blockquote>
  <p>만일 여러분이 코딩을 할 수 있게 된다면, 앉은 자리에서 무엇인가를 만들어 낼 수 있고, 아무도 당신을 막을 수 없을 것입니다.</p>
  <cite>&mdash; 마크 저커버그 메타 CEO</cite>
</blockquote>
<blockquote>
  <p>코딩을 배우는 건 '여러분의 미래'는 물론 '조국의 미래'에도 매우 중요한 일입니다.</p>
  <cite>&mdash; 버락 오바마 미국 대통령</cite>
</blockquote>
<blockquote>
  <p>코딩은 모든 문제에 대해 '새로운 해결책을 도출할 수 있는 힘'을 길러준다.</p>
  <cite>&mdash; 빌 게이츠 MS 창업자</cite>
</blockquote>
<blockquote>
  <p>산업혁명의 동력은 수학 교육, 이제는 코딩이 수학과 같은 역할</p>
  <cite>&mdash; 데이비드 로스 전 영국 교육장관</cite>
</blockquote>
    
      
      
      
      
      
      
          `,   
      authCheck.statusUI(req, res)
    );
    res.send(html);
    
    }
  )

  module.exports = router;