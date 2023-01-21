var express = require('express');
var router = express.Router();
var template_main = require('../lib_login/template.js');
var authCheck = require('../lib_login/authCheck.js');
var Tokens = require("csrf");
var tokens = new Tokens();

router.get('/', (req, res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var html = template_main.HTML('Welcome',
        `<div align="center">
        <button type="button" class="btn btn--yellow">
        <span class="btn__txt">코딩나라 커라큘럼</span>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
    </button>
        <button type="button" class="btn btn--purple">
        <span class="btn__txt">스크레치 / ENTRY</span>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
    </button>
    
    <button type="button" class="btn btn--green">
        <span class="btn__txt">앱 인벤터</span>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
    </button>
    
    <button type="button" class="btn btn--red">
        <span class="btn__txt">웹 사이트 제작 / 파이썬</span>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
    </button>
    
    <button type="button" class="btn btn--blue">
        <span class="btn__txt">Java / 마인크래프트 / C언어</span>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
        <i class="btn__bg" aria-hidden="true"></i>
    </button>
    
    
    
    </div>
        <div class="band band--white">
        <div class="inner band--inner">
            <div class="row">
            <h2>새싹과정</h2>
                <div class="col">
                    <h3 class = "col_title" >스크레치</h3>
                    <ul class="number-circle-list">
                        <li class="number-circle-list--list-item">코딩이란? 스크래치란?</li>
                        <li class="number-circle-list--list-item">스크래치 실행 준비, 인터페이스 소개</li>
                        <li class="number-circle-list--list-item">스크래치 블록, 스프라이트 움직이기</li>
                        <li class="number-circle-list--list-item">프로젝트 저장과 열기</li>
                        <li class="number-circle-list--list-item">말풍선으로 대화 출력</li>
                        <li class="number-circle-list--list-item">애니메이션 효과 연출</li>
                        <li class="number-circle-list--list-item">크기, 배경, 모양 바꾸기</li>
                        <li class="number-circle-list--list-item">소리 추가, 재생하기</li>
                        <li class="number-circle-list--list-item">펜 기능을 사용하여 작품 출력</li>
                        <li class="number-circle-list--list-item">제어 블럭</li>
                        <li class="number-circle-list--list-item">관찰 블럭</li>
                        <li class="number-circle-list--list-item">방송하기 블럭</li>
                        <li class="number-circle-list--list-item">연산 블럭</li>
                        <li class="number-circle-list--list-item">함수</li>
                        <li class="number-circle-list--list-item">리스트</li>
                        <li class="number-circle-list--list-item">변수</li>
                    </ul>
                    <h3 class = "col_title" >ENTRY</h3>
                    <ol class="number-circle-list">
                    <li class="number-circle-list--list-item">코딩이란? ENTRY란?</li>
                    <li class="number-circle-list--list-item">ENTRY 실행 준비, 인터페이스 소개</li>
                    <li class="number-circle-list--list-item">ENTRY 블록, 스프라이트 움직이기</li>
                    <li class="number-circle-list--list-item">프로젝트 저장과 열기</li>
                    <li class="number-circle-list--list-item">말풍선으로 대화 출력</li>
                    <li class="number-circle-list--list-item">애니메이션 효과 연출</li>
                    <li class="number-circle-list--list-item">크기, 배경, 모양 바꾸기</li>
                    <li class="number-circle-list--list-item">소리 추가, 재생하기</li>
                    <li class="number-circle-list--list-item">펜 기능을 사용하여 작품 출력</li>
                    <li class="number-circle-list--list-item">제어 블럭</li>
                    <li class="number-circle-list--list-item">관찰 블럭</li>
                    <li class="number-circle-list--list-item">방송하기 블럭</li>
                    <li class="number-circle-list--list-item">연산 블럭</li>
                    <li class="number-circle-list--list-item">함수</li>
                    <li class="number-circle-list--list-item">리스트</li>
                    <li class="number-circle-list--list-item">변수</li>
                    </ol>
                </div>
                <h2>초급과정</h2>
                <div class="col">
                    <h3 class = "col_title">앱인벤터</h3>
                    <ul class="number-circle-list number-circle-list--primary-color">
                        <li class="number-circle-list--list-item">코딩이란? 앱인벤터란?</li>
                        <li class="number-circle-list--list-item">앱인벤터 설치 및 준비하기</li>
                        <li class="number-circle-list--list-item">SW 제작기초 쌓기 1</li>
                        <li class="number-circle-list--list-item">SW 제작기초 쌓기 2</li>
                        <li class="number-circle-list--list-item">SW 제작기초 쌓기 3</li>
                        <li class="number-circle-list--list-item">SW 제작기초 쌓기 4</li>
                        <li class="number-circle-list--list-item">카메라 기능 활용하기</li>
                        <li class="number-circle-list--list-item">캔버스 기능 활용하기</li>
                        <li class="number-circle-list--list-item">위치 센서 기능 활용하기</li>
                        <li class="number-circle-list--list-item">방향 센서 기능 활용하기</li>
                        <li class="number-circle-list--list-item">문자 기능 활용하기</li>
                        <li class="number-circle-list--list-item">공유 기능 활용하기</li>
                        <li class="number-circle-list--list-item">변수</li>
                        <li class="number-circle-list--list-item">리스트</li>
                        <li class="number-circle-list--list-item">TinyDB</li>
                        <li class="number-circle-list--list-item">조건문</li>
                        <li class="number-circle-list--list-item">반복문</li>
                        <li class="number-circle-list--list-item">실전</li>
                    </ul>
                </div>
                <h2>중급과정</h2>
                <div class="col">
                    <h3 class = "col_title">웹 사이트 제작</h3>
                    <ul class="number-circle-list number-circle-list--secondary-color">
                        <li class="number-circle-list--list-item">코딩이란? 웹이란?</li>
                        <li class="number-circle-list--list-item">웹 개발 설명, 개발환경 설정</li>
                        <li class="number-circle-list--list-item">HTML 기본 문서 만들기</li>
                        <li class="number-circle-list--list-item">웹 문서에 다양한 내용 입력</li>
                        <li class="number-circle-list--list-item">입력 양식 작성하기</li>
                        <li class="number-circle-list--list-item">CSS의 기본</li>
                        <li class="number-circle-list--list-item">텍스트를 표현하는 다양한 스타일</li>
                        <li class="number-circle-list--list-item">레이아웃을 구성하는 CSS박스 모델</li>
                        <li class="number-circle-list--list-item">이미지와 그라데이션 효과로 배경 꾸미기</li>
                        <li class="number-circle-list--list-item">CSS 고급 선택자</li>
                        <li class="number-circle-list--list-item">트랜지션과 애니메이션</li>
                        <li class="number-circle-list--list-item">반응형 엡과 미디어 쿼리</li>
                        <li class="number-circle-list--list-item">자바스크립트 기초</li>
                        <li class="number-circle-list--list-item">자바스크립트 기본 문법</li>
                        <li class="number-circle-list--list-item">함수와 이벤트</li>
                        <li class="number-circle-list--list-item">자바스크립트와 객체</li>
                        <li class="number-circle-list--list-item">문서 객체 모델(DOM)</li>
                        <li class="number-circle-list--list-item">실습</li>
                    </ul>
                    <h3 class = "col_title">파이썬</h3>
                    <ol class="number-circle-list number-circle-list--secondary-color">
                        <li class="number-circle-list--list-item">코딩이란? 파이썬이란?</li>
                        <li class="number-circle-list--list-item">파이썬 설치, 실행</li>
                        <li class="number-circle-list--list-item">숫자형</li>
                        <li class="number-circle-list--list-item">문자열 자료형</li>
                        <li class="number-circle-list--list-item">리스트 자료형</li>
                        <li class="number-circle-list--list-item">튜플 자료형</li>
                        <li class="number-circle-list--list-item">딕셔너리 자료형</li>
                        <li class="number-circle-list--list-item">집합 자료형</li>
                        <li class="number-circle-list--list-item">변수</li>
                        <li class="number-circle-list--list-item">if문</li>
                        <li class="number-circle-list--list-item">while문</li>
                        <li class="number-circle-list--list-item">for문</li>
                        <li class="number-circle-list--list-item">함수</li>
                        <li class="number-circle-list--list-item">사용자 입력과 출력</li>
                        <li class="number-circle-list--list-item">클래스</li>
                        <li class="number-circle-list--list-item">모듈</li>
                        <li class="number-circle-list--list-item">패키지</li>
                        <li class="number-circle-list--list-item">예외처리</li>
                        <li class="number-circle-list--list-item">실습</li>
                    </ol>
                </div>
                <h2>고급과정</h2>
                <div class="col">
                    <h3 class = "col_title">Java</h3>
                    <ul class="number-circle-list number-circle-list--tertiary-color">
                        <li class="number-circle-list--list-item">코딩이란? JAVA란?</li>
                        <li class="number-circle-list--list-item">변수형</li>
                        <li class="number-circle-list--list-item">숫자형</li>
                        <li class="number-circle-list--list-item">문자형</li>
                        <li class="number-circle-list--list-item">데이터 유형 변환</li>
                        <li class="number-circle-list--list-item">메소드</li>
                        <li class="number-circle-list--list-item">문자열 클래스</li>
                        <li class="number-circle-list--list-item">임의 클래스</li>
                        <li class="number-circle-list--list-item">수학 클래스</li>
                        <li class="number-circle-list--list-item">부울 표현식</li>
                        <li class="number-circle-list--list-item">if문</li>
                        <li class="number-circle-list--list-item">switch문</li>
                        <li class="number-circle-list--list-item">for문</li>
                        <li class="number-circle-list--list-item">while문</li>
                        <li class="number-circle-list--list-item">break문,continue문</li>
                        <li class="number-circle-list--list-item">클래스 생성</li>
                        <li class="number-circle-list--list-item">객체 인스턴스화</li>
                        <li class="number-circle-list--list-item">생성자</li>
                        <li class="number-circle-list--list-item">오버로딩 메소드</li>
                        <li class="number-circle-list--list-item">객체 상호 작용 및 메소드</li>
                        <li class="number-circle-list--list-item">1차원 배열</li>
                        <li class="number-circle-list--list-item">예외사항 처리</li>
                        <li class="number-circle-list--list-item">실습</li>
                    </ul>
                    <h3 class = "col_title" >마인크래프트</h3>
                    <ul class="number-circle-list number-circle-list--tertiary-color">
                        <li class="number-circle-list--list-item">코딩이란? 마인크래프트코딩이란?</li>
                        <li class="number-circle-list--list-item">마인크래프트와 파이썬, 마인크래프트 설치, 파이썬 설치</li>
                        <li class="number-circle-list--list-item">서버설정</li>
                        <li class="number-circle-list--list-item">MCPI 설치</li>
                        <li class="number-circle-list--list-item">멀티플레이로 MCPI 실행</li>
                        <li class="number-circle-list--list-item">게임 접속</li>
                        <li class="number-circle-list--list-item">게임 인터페이스</li>
                        <li class="number-circle-list--list-item">게임 단축키</li>
                        <li class="number-circle-list--list-item">명령어</li>
                        <li class="number-circle-list--list-item">파이썬 마인크래프트 연결</li>
                        <li class="number-circle-list--list-item">초급 텔레포트</li>
                        <li class="number-circle-list--list-item">고급 텔레포트</li>
                        <li class="number-circle-list--list-item">자동 건축</li>
                        <li class="number-circle-list--list-item">자연어 처리</li>                    <li class="number-circle-list--list-item">서버설정</li>
                        <li class="number-circle-list--list-item">건축 프로젝트</li>
                        <li class="number-circle-list--list-item">AI 프로젝트</li>
                    </ul>
                    <h3 class = "col_title" >C언어</h3>
                    <ol class="number-circle-list number-circle-list--tertiary-color">
                        <li class="number-circle-list--list-item">코딩이란? C언어란?</li>
                        <li class="number-circle-list--list-item">자료형</li>
                        <li class="number-circle-list--list-item">아스키 코드</li>
                        <li class="number-circle-list--list-item">변수, 논리 변수</li>
                        <li class="number-circle-list--list-item">입,출력</li>
                        <li class="number-circle-list--list-item">연산자</li>
                        <li class="number-circle-list--list-item">조건문</li>
                        <li class="number-circle-list--list-item">반복문</li>
                        <li class="number-circle-list--list-item">배열</li>
                        <li class="number-circle-list--list-item">2차원배열</li>
                        <li class="number-circle-list--list-item">문자열</li>
                        <li class="number-circle-list--list-item">함수</li>
                        <li class="number-circle-list--list-item">동적할당</li>
                        <li class="number-circle-list--list-item">파일 입출력</li>
                        <li class="number-circle-list--list-item">실습</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
        
        `,   
        authCheck.statusUI(req, res)
        );
        res.send(html);
    }
})
module.exports = router;  