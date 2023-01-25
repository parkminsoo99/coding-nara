var express = require('express');
var router = express.Router();
var template_main = require('../lib_login/template.js');
var authCheck = require('../lib_login/authCheck.js');

router.get('/', (req, res) => {
    // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있어도 로그인 페이지로 이동시킴
    //   res.redirect('/auth/login');
    //   return false;
    // }
    var html = template_main.HTML
    
    
    ('Welcome',
      `<br /><br />
      <h2>FAQ</h2>
      <details>
    <summary>강의는 얼마인가요?</summary>
    <div class="tpt">코딩나라는 총 7가지의 다양한 코딩 강의를 제공하고 있으며, 각 강의의 가격은 아래와 같습니다.
    1. C언어 → 30,000(1회) 2. Python →  3. </div>
</details>
<details>
    <summary>강의 진행 방식은 어떻게 되나요?</summary>
    <div class="tpt">코딩나라의 강의 진행 방식은 오로지 강사와 1:1 온라인 과외 형식으로 진행됩니다.</div>
</details>
<details>
<summary>문의는 어떻게 하나요?</summary>
<div class="tpt">F&A에서 원하는 답변을 찾지 못하셨으면, 아래 보이시는 고객센터 연락처로 직접 연락을 주시거나 이메일로 문의 주시면 됩니다.</div>
</details>
<details>
<summary>포인트는 사라지나요?</summary>
<div class="tpt">코딩나라 홈페이지에서 얻으신 포인트는 사라지지 않습니다.</div>
</details>
<details>
<summary>커리큘럼에 적힌대로 따라가야 하나요?</summary>
<div class="tpt">코딩나라 홈페이지에서 확인할 수 있는 커리큘럼은 저희가 해당 과목에 대한 희망 아이의 나이와 도움이 되는 선수과목을 제시한 것이며, 굳이 따라가실 필요는 없습니다.</div>
</details>
<details>
<summary>우리 아이는 어떤 강의를 들어야 할까요?</summary>
<div class="tpt">아이가 어떤 강의를 들어야할 지 고민이라면, 고객센터 연락처(고객센터 연락처)로 연락주시면 자세한 상담 진행해 하도록 하겠습니다.</div>
</details>
<details>
<summary>자격증 커리큘럼은 어떻게 신청하나요?</summary>
<div class="tpt">자격증 커리큘럼 같은 경우 자격증을 취득할 수 있는 강의를 선택한 후 고객센터로 연락주시면 해당 강사님께 전달하여 준비할 수 있도록 도와드립니다.</div>
</details>
<details>
<summary>진행되고 있는 이벤트는 뭔가요?</summary>
<div class="tpt">현재 진행되고 있는 이벤트는 아래와 같습니다.
1. 추천인 가입 이벤트로 포인트 30,000원을 지급
2. 강의 듣고, 리뷰 작성할 시 5,000원을 지급</div>
</details>
<details>
<summary>강의를 환불 받고 싶습니다.</summary>
<div class="tpt">아래 조항을 살펴보시고 고객센터 연락처(고객센터 연락처)로 연락주시면 자세한 상담 진행해드리겠습니다.
- 개인과외교습자는 학습자가 수강을 계속할 수 없는 경우 또는 학원의 등록말소, 교습소 폐지 등으로 교습을 계속할 수 없는 경우 학습자로부터 받은 교습비 등을 반환 사유 발생일부터 5일 이내에 반환해야 합니다(「학원의 설립·운영 및 과외교습에 관한 법률」 제18조제1항 및 「학원의 설립·운영 및 과외교습에 관한 법률 시행령」 제18조제3항).
- 교습비 등 반환사유 및 반환기준(「학원의 설립·운영 및 과외교습에 관한 법률 시행령」제18조제2항·제3항 및 별표 4)
(강의 환불 이미지 추가)</div>
</details>

 

<style>
details { margin:5px 0 10px; }
details > summary { background:#fff; color:#444; padding:10px; outline:0; border-radius:5px; cursor:pointer; transition:background 0.5s; text-align:left; box-shadow: 1px 1px 2px gray;}
details > summary::-webkit-details-marker { background:#fff; color:#444; background-size:contain; transform:rotate3d(0, 0, 1, 90deg); transition:transform 0.25s;}
details[open] > summary::-webkit-details-marker { transform:rotate3d(0, 0, 1, 180deg);}
details[open] > summary { background:#fff;}
details[open] > summary ~ * { animation:reveal 0.5s;}
.tpt { background:#fff; color:#444; margin:5px 0 10px; padding:5px 10px; line-height:25px; border-radius:5px; box-shadow: 1px 1px 2px gray;}

@keyframes reveal {
    from { opacity:0; transform:translate3d(0, -30px, 0); }
    to { opacity:1; transform:translate3d(0, 0, 0); }
}
</style>

 
     
  
  
          `,   
      authCheck.statusUI(req, res)
    );
    res.send(html);
  })

  module.exports = router;