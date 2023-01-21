var express = require('express');
var router = express.Router();
var template_main = require('../lib_login/template.js');
var authCheck = require('../lib_login/authCheck.js');
var sanitizeHtml = require('sanitize-html');
var Tokens = require("csrf");
var tokens = new Tokens();


router.get('/', (req, res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
    console.log('main_req :',req.session.type);
    var html = template_main.HTML('Welcome',
      `
      <div align=center>
      <p id="title"><h1>실시간 온라인<h2></p>
      <p id="title"><h1>코딩교육을 한곳에서</h1></p>
      <p><h3>우리 아이에 적합한 교육 서비스를 경험해보세요<h3></p>
      <button class="button-arounder" >시작하기</button>
      <p><h1>코딩나라가 제공하는 서비스<h2></p><p><h1></h1></p>
      <div class="container" id="borderDemo">
          <h1>처음 접하는 아이들에게 맞춤교육</h1>
        <div id="bg2">xw
        </div>
        <h2 id="mg">코딩의 첫걸음을 쉽게 이끌어주도록 도와줍니다</h2>
      </div>
      </div>
      <p><h1>잘 성립된 커리큘럼</h1><p>
      <div class="card card-3"></div><div class="card card-3"></div><div class="card card-3"></div>
      <div id="bg3" align=center>
        </div>
        <h2 id="mg">단계별로 과목이 나누어져 있으며 아이들에게 맞춰서 진행합니다.</h2>
      <div align="right">
      <p><h1>1대1로 실시간으로 문제 해결</h1></p>
      <div id="bg4">
        </div>
      </div>
        <h2 id="mg">처음 접하는 아이들에게 맞춤교육</h2>
      <p><h1>어디서든 들을 수 있는 교육</h1></p>
      <div id="bg5">
        </div>
        <h2 id="mg">처음 접하는 아이들에게 맞춤교육</h2>
      <p><h1>원하는 시간을 선택</h1></p>
      <a id="add-channel-button" "href="javascript:addChannel()">
        <img src="../image/kakaochannel.png" id=kakaochannel
          alt="카카오톡 채널 추가하기 버튼" />
      </a>
    <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.1.0/kakao.min.js"
  integrity="sha384-dpu02ieKC6NUeKFoGMOKz6102CLEWi9+5RQjWSV0ikYSFFd8M3Wp2reIcquJOemx" crossorigin="anonymous"></script>
<script>
  Kakao.init('4460effe506632bfd3925a6c2dfca20d'); // 사용하려는 앱의 JavaScript 키 입력
</script>
<script>
  function addChannel() {
    Kakao.Channel.addChannel({
      channelPublicId: '_xfyhFxj',
    });
  }
</script>

      
      <p><h3><h3></p>
      
      
          `,   
      authCheck.statusUI(req, res)
    );
    res.send(html);
    }
  }
)
  

  module.exports = router;