
let basket = {
    totalCount: 0, 
    totalPrice: 0,
    totalPoint: 0,
    original_price : 0,
    original_point : 0,
    count :0,
    
    //재계산
    reCalc: function(inital_point,course_price){
        if(this.count == 0) {
            this.original_point = inital_point;
            this.original_price = course_price;
            this.count++;
        }
        this.totalCount = 0;
        this.totalPrice = 0;
        this.totalPoint = inital_point;
        var use_point = document.querySelector('input[name=p_point]').getAttribute('value');
        if(use_point == null) use_point = 0;
        var count = document.querySelector('input[name=p_num ]').getAttribute('value');
        count = parseInt(count)
        if(isNaN(count)) count = 1;
        this.totalCount += count;
        var price = course_price
        this.totalPrice += count * price;
        if(document.getElementById('p_point_button').disabled == true){
            this.totalPoint = parseInt(this.totalPoint) -  parseInt(use_point);
            this.totalPrice -= use_point;
        }
    },
    //화면 업데이트
    updateUI: function () {
        document.querySelector('#sum_p_num').textContent = '총 강의 횟수 : ' + this.totalCount.formatNumber() + ' 회';
        document.querySelector('#sum_p_price').textContent = '총 합계금액 : ' + this.totalPrice.formatNumber() + ' 원';
        document.querySelector('#point').textContent = this.totalPoint.formatNumber();
    },
    Enroll_info : function(imp_uid, merchant_uid, student_ID, course_ID, date_ID, time_ID, teacher_ID, price, count){
        $.ajax({
            type: "post", 
            url: "/enroll/enroll_normal_payment",
            dataType: "json",
            data: {
                Student_ID : student_ID,
                Course_ID : course_ID, 
                Date_ID : date_ID, 
                Time_ID : time_ID, 
                Teacher_ID : teacher_ID,
                Count: count,
                Price : price,
                Imp_Uid : imp_uid,
                Merchant_Uid : merchant_uid
            }
        })
    },
    Show : function() {
        this.reCalc(this.original_point, this.original_price);
        this.updateUI();
    },
    Point : function(){
        var item = document.querySelector('input[name=p_point]');
        item.addEventListener("keyup", function (e) {
            e.target.value =  e.target.value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');
            item.setAttribute('value',e.target.value);
        })
    },
    changePNum: function (course_price) {
        var item = document.querySelector('input[name=p_num]');
        item.addEventListener("keyup", function (e) {
            e.target.value =  e.target.value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');
            item.setAttribute('value',e.target.value);
        })
        var p_num = parseInt(item.getAttribute('value'));
        if(isNaN(p_num)) p_num = 1;
        var newval = event.target.classList.contains('up') ? p_num+1 : event.target.classList.contains('down') ? p_num-1 : event.target.value;
        if (parseInt(newval) < 1 || parseInt(newval) > 99) { return false; }
        item.setAttribute('value', newval);
        item.value = newval;
        //AJAX 업데이트 전송

        //전송 처리 결과가 성공이면    
        this.reCalc(this.original_point,this.original_price);
        this.updateUI();
    },
    Point_use : function(student_ID, course_ID, date_ID, time_ID, teacher_ID){
        var item = document.querySelector('input[name=p_point]');
        var item_button = document.getElementById('p_point_button')
        var point = item.getAttribute('value');
        var item_point = document.getElementById('point');
        if(point < 10){alert('10포인트 이상 사용가능합니다.'); return false;}
        point = Number(point.replaceAll(",", ""));
        item_point = Number(item_point.innerText.replaceAll(",", ""));
        if(point > item_point){alert("포인트 초과"); return false;}
        else{
            item_button.disabled=true;
            item.disabled = true;
            item_point -= point;
            document.querySelector('#point').textContent = item_point.toLocaleString("ko-KR");
            if(point != null){
                var count = document.querySelector('input[name=p_num ]').getAttribute('value');
                $.ajax({
                        type: "post", 
                        url: "/enroll/enroll_insert_point",
                        dataType: "json",
                        data: {
                            Student_ID : student_ID,
                            Course_ID : course_ID, 
                            Date_ID : date_ID, 
                            Time_ID : time_ID, 
                            Teacher_ID : teacher_ID,
                            Count: count,
                            Point : point,
                        }
                    })}
            this.reCalc(this.original_point,this.original_price);
            this.updateUI();
        }
    },
    set_price : function(student_ID, course_ID, date_ID, time_ID, teacher_ID, price){
        var count = document.querySelector('input[name=p_num ]').getAttribute('value');
        $.ajax({
            type: "post", 
            url: "/enroll/enroll_save_price",
            dataType: "json",
            data: {
                Student_ID : student_ID,
                Course_ID : course_ID, 
                Date_ID : date_ID, 
                Time_ID : time_ID, 
                Teacher_ID : teacher_ID,
                Price : price,
                Count: count,
            }
        })
    },
    get_result_price_point : function(student_ID, course_ID, date_ID, time_ID, teacher_ID){
        var price = 0;
        var point = 0;
        var nickname = '';
        var email_address = '';
        var phone_number = '';
        var address = '';
        var postcode = 0;
        $.ajax({
            type: "post", 
            url: "/enroll/enroll_get_result_price_point",
            dataType: "json",
            async: false, 
            data: {
                Student_ID : student_ID,
                Course_ID : course_ID, 
                Date_ID : date_ID, 
                Time_ID : time_ID, 
                Teacher_ID : teacher_ID,
            },
            success: function(data) {
                alert(JSON.stringify(data.result))
                price = Number(JSON.stringify(data.result[0].Payment_Price));
                point = Number(JSON.stringify(data.result[0].Use_Point));
                nickname = JSON.stringify(data.result[0].Name);
                email_address = JSON.stringify(data.result[0].Email_Address);
                phone_number = JSON.stringify(data.result[0].Phone_Number);
                address = JSON.stringify(data.result[0].Address);
                postcode = Number(JSON.stringify(data.result[0].PostCode));
                count = Number(JSON.stringify(data.result[0].Count));
            }
        })     
        return ({price, point, nickname, email_address, phone_number, address, postcode, count});
    },
    payment : function(Course_Active, student_ID, course_ID, date_ID, time_ID, teacher_ID, price){
        var link =  document.location.href;
        const IMP = window.IMP;
        IMP.init("imp71467660");
        const make_merchant_uid = () => {
          const current_time = new Date();
          const year = current_time.getFullYear().toString();
          const month = (current_time.getMonth() + 1).toString();
          const day = current_time.getDate().toString();
          const hour = current_time.getHours().toString();
          const minute = current_time.getMinutes().toString();
          const second = current_time.getSeconds().toString();
          const merchant_uid =
            "MIHEE" + year + month + day + hour + minute + second;
          return merchant_uid;
        };
        const merchant_uid = make_merchant_uid();
        basket.set_price(student_ID, course_ID, date_ID, time_ID, teacher_ID, price);
        setTimeout(() => {
            var price_point_name = basket.get_result_price_point(student_ID, course_ID, date_ID, time_ID, teacher_ID);
            const reg = /[\{\}\[\]\/?,;:|\)*~`!^\-_+<>\#$%&\\\=\(\'\"]/gi;
            var result_price = JSON.stringify(price_point_name.price);
            var payment_name = (JSON.stringify(price_point_name.nickname)).replace(reg, "");
            var email_address = JSON.stringify(price_point_name.email_address).replace(reg, "");
            var phone_number = JSON.stringify(price_point_name.phone_number).replace(reg, "");
            var address = JSON.stringify(price_point_name.address).replace(reg, "");
            var postcode = JSON.stringify(price_point_name.postcode);
            var count = JSON.stringify(price_point_name.count);
            if ( Course_Active == 1) {
                alert("이미 결제가 이뤄진 강의가 존재합니다.");
                window.location.href = "http://localhost:54213/enroll/sub";
            } else {
                // IMP.request_pay(param, callback) 결제창 호출
                IMP.request_pay(
                {
                    pg: "html5_inicis.INIpayTest",
                    /*
                        'kakao':카카오페이,
                        html5_inicis':이니시스(웹표준결제)
                            'nice':나이스페이
                            'jtnet':제이티넷
                            'uplus':LG유플러스
                            'danal':다날
                            'payco':페이코
                            'syrup':시럽페이
                            'paypal':페이팔
                        */
                    pay_method: "card",
                    /*
                        'samsung':삼성페이,
                        'card':신용카드,
                        'trans':실시간계좌이체,
                        'vbank':가상계좌,
                        'phone':휴대폰소액결제
                    */
                    merchant_uid: merchant_uid,

                    name: payment_name,
                    amount: result_price,//result_price,
                    buyer_email: email_address,
                    buyer_name: payment_name,
                    buyer_tel: phone_number,
                    buyer_addr: address,
                    buyer_postcode: postcode,

                    /*
                        모바일 결제시,
                        결제가 끝나고 랜딩되는 URL을 지정
                        (카카오페이, 페이코, 다날의 경우는 필요없음. PC와 마찬가지로 callback함수로 결과가 떨어짐)
                        */
                },
                function (rsp) {
                    if (rsp.status == "paid" && rsp.paid_amount == 100) { //result_price(실제 금액)
                        if (rsp.success) {
                        basket.Enroll_info(rsp.imp_uid,rsp.merchant_uid, student_ID, course_ID, date_ID, time_ID, teacher_ID, price, count); //결제 완료했을 떄 Section에 추가
                        var msg = "결제가 완료되었습니다.";
                        msg += "고유ID : " + rsp.imp_uid;
                        msg += "상점 거래ID : " + rsp.merchant_uid;
                        msg += "결제 금액 : " + rsp.paid_amount;
                        msg += "카드 승인번호 : " + rsp.apply_num;
                        alert(msg);
                        window.location.href =
                        "http://localhost:54213/myinfo"
                    } else {
                        var msg = "결제에 실패하였습니다.";
                        msg += "에러내용 : " + rsp.error_msg;
                        window.location.href = link
                        alert(msg);
                    }
                    } else {
                    alert("결제를 취소하거나 잘못된 결제입니다.");
                    window.location.href = link
                    }
                }
            );}
        }, 300);
    },
    reload : function(student_ID, course_ID, date_ID, time_ID, teacher_ID){
        // window.location.href = "http://localhost:54213/enroll/enroll_delete_payment?Student_ID=" + student_ID + "&Course_ID=" + course_ID + "&Date_ID=" + date_ID + "&Time_ID=" + time_ID + "&Teacher_ID=" + teacher_ID;
        console.log("[window onload] : [start]");
          $.ajax({
            type: "post",
            url: "http://localhost:54213/enroll/enroll_delete_payment",
            dataType: "json",
            timeout : 3000,
            data: {
                Student_ID : student_ID,
                Course_ID : course_ID, 
                Date_ID : date_ID, 
                Time_ID : time_ID, 
                Teacher_ID : teacher_ID,
                Count: 1,
            },
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log('2. fail 을 탄다 : ' + errorThrown);
        });
    },
    move_cart : function(student_ID, course_ID, date_ID, time_ID, teacher_ID){
        var count = document.querySelector('input[name=p_num ]').getAttribute('value');
        const reg = /[\{\}\[\]\/?,;:|\)*~`!^\-_+<>\#$%&\\\=\(\'\"]/gi;
        $.ajax({
            type: "post", 
            url: "http://localhost:54213/enroll/enroll_move_cart",
            dataType: "json",
            data: {
                Student_ID : student_ID,
                Course_ID : course_ID, 
                Date_ID : date_ID, 
                Time_ID : time_ID, 
                Teacher_ID : teacher_ID,
                Count: count,
            },
            success : function(data){
                alert(JSON.stringify(data.result))
                if(JSON.stringify(data.result).replaceAll(reg,"") == "success"){
                    alert("장바구니에 해당 강좌를 담았습니다.")
                }else{
                    alert("이미 존재하는 강좌입니다.")
                }
            }
        })
    },
}

// 숫자 3자리 콤마찍기
Number.prototype.formatNumber = function(){
    if(this==0) return 0;
    let regex = /(^[+-]?\d+)(\d{3})/;
    let nstr = (this + '');
    while (regex.test(nstr)) nstr = nstr.replace(regex, '$1' + ',' + '$2');
    return nstr;
};

function Show_Course_info(Subject){
    var link =  document.location.href;
      var sub = Subject;
      if(sub === "C언어")
      {
      //과목 소개
      document.getElementById("image").setAttribute("src","data:image/png;base64,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")
      document.getElementById("subject1").innerHTML = "<span>" + "C언어는 현재 사용하고 있는 거의 모든 컴퓨터 시스템에서 사용할 수 있는 프로그래밍 언어" + "<br></span>";
      document.getElementById("subject2").innerHTML = "<span>" + "프로그래밍 언어란 컴퓨터의 시스템을 구동시키는 소프트웨어를 작성하기 위한 언어" + "<br></span>";
      document.getElementById("subject3").innerHTML = "<span>" + "C언어는 빠른 언어로, 높은 성능과 속도를 요구하는 애플리케이션에 적합" + "<br></span>";
      document.getElementById("subject4").innerHTML = "<span>" + "윈도우, 리눅스, macOS를 포함한 다양한 플랫폼에서 컴파일되고 실행됨" + "<br></span>";
      document.getElementById("subject5").innerHTML = "<span>" + "수동 메모리 관리를 제공" + "<br></span>";
      document.getElementById("subject6").innerHTML = "<span>" + "절차지향 언어로, 문제를 해결하기 위한 단계별 절차에 초점을 맞춤" + "<br></span>";
      //특징
      document.getElementById("feature").innerHTML = "<span>" + "고급과정 이수체계이며 평균 교육과정은 6~8개월입니다." + "<br></span>";
      //커리큘럼
      document.getElementById("curri-body1").innerHTML = "<span>" + "코딩이란? C언어란?" + "<br></span>";
      document.getElementById("curri-body2").innerHTML = "<span>" + "자료형" + "<br></span>";
      document.getElementById("curri-body3").innerHTML = "<span>" + "아스키 코드" + "<br></span>";
      document.getElementById("curri-body4").innerHTML = "<span>" + "변수, 논리 변수" + "<br></span>";
      document.getElementById("curri-body5").innerHTML = "<span>" + "입,출력" + "<br></span>";
      document.getElementById("curri-body6").innerHTML = "<span>" + "연산자" + "<br></span>";
      document.getElementById("curri-body7").innerHTML = "<span>" + "조건문" + "<br></span>";
      document.getElementById("curri-body8").innerHTML = "<span>" + "반복문" + "<br></span>";
      document.getElementById("curri-body9").innerHTML = "<span>" + "배열" + "<br></span>";
      document.getElementById("curri-body10").innerHTML = "<span>" + "2차원 배열" + "<br></span>";
      document.getElementById("curri-body11").innerHTML = "<span>" + "문자열" + "<br></span>";
      document.getElementById("curri-body12").innerHTML = "<span>" + "함수" + "<br></span>";
      document.getElementById("curri-body13").innerHTML = "<span>" + "동적할당" + "<br></span>";
      document.getElementById("curri-body14").innerHTML = "<span>" + "파일입출력" + "<br></span>";
      document.getElementById("curri-body15").innerHTML = "<span>" + "실습" + "<br></span>";
      //과목관련 이미지
      document.getElementById("body_img1").setAttribute("src", "../../../../image/C/C1.jpeg")
      document.getElementById("body_img2").setAttribute("src", "../../../../image/C/C2.png")
      //삭제
      document.getElementById('curri-body16').style.display = 'none'
      document.getElementById('curri-body17').style.display = 'none'
      document.getElementById('curri-body18').style.display = 'none'
      document.getElementById('curri-body19').style.display = 'none'
      document.getElementById('body_img3').style.display = 'none'
      document.getElementById('third_img').style.display = 'none'
      //Description
      document.getElementById('body_img1_description_1').innerHTML = "“C는 유별나고, 결함 있고, 터무니없게 성공했다.”"
      document.getElementById('body_img1_description_2').innerHTML = "- 데니서 리치(Dennis M. Ritchie)"
      document.getElementById('body_img1_description_3').innerHTML = "C언어로 만든 공룡게임"
      document.getElementById('body_img1_description_4').style.display = 'none'

      }

      else if(sub === "Python")
      {
      document.getElementById("image").setAttribute("src","../../../../image/python/1.png")
      //과목 소개
      document.getElementById("subject1").innerHTML = "<span>" + "파이썬은 간단하고 배우기 쉬운 구문을 가지고 있어서 초보자들에게 인기 있는 언어" + "<br></span>";
      document.getElementById("subject2").innerHTML = "<span>" + "동적이고 유연한 언어로, 웹 개발에서 과학 컴퓨팅, 데이터 분석에 이르기까지 광범위한 응용 분야에 사용" + "<br></span>";
      document.getElementById("subject3").innerHTML = "<span>" + "윈도우, macOS, 리눅스를 포함한 다양한 운영 체제에서 실행" + "<br></span>";
      document.getElementById("subject4").innerHTML = "<span>" + "파이썬은 객체 지향 언어로 객체와 클래스의 생성을 지원하여 보다 체계적이고 재사용 가능" + "<br></span>";
      document.getElementById("subject5").innerHTML = "<span>" + "광범위한 기능을 제공하고 일반적인 프로그래밍 작업을 쉽게 수행할 수 있는 대규모 표준 라이브러리를 제공" + "<br></span>";
      document.getElementById("subject6").innerHTML = "<span>" + "파이썬은 오픈 소스 언어로, 자유롭게 사용하고 수정 가능" + "<br></span>";
      //특징
      document.getElementById("feature").innerHTML = "<span>" + "중급과정 이수체계이며 평균 교육과정은 4~6개월입니다.<br /><span style=`color : red`>파이썬 심화는 고급과정 이수체계이며 평균 교육과정은 6~8개월입니다.</span>"+ "<br></span>";
      //커리큘럼
      document.getElementById("curri-body1").innerHTML = "<span>" + "코딩이란? 파이썬이란?" + "<br></span>";
      document.getElementById("curri-body2").innerHTML = "<span>" + "파이썬 설치, 실행" + "<br></span>";
      document.getElementById("curri-body3").innerHTML = "<span>" + "숫자형" + "<br></span>";
      document.getElementById("curri-body4").innerHTML = "<span>" + "문자열 자료형" + "<br></span>";
      document.getElementById("curri-body5").innerHTML = "<span>" + "리스트 자료형" + "<br></span>";
      document.getElementById("curri-body6").innerHTML = "<span>" + "튜플 자료형" + "<br></span>";
      document.getElementById("curri-body7").innerHTML = "<span>" + "딕셔너리 자료형" + "<br></span>";
      document.getElementById("curri-body8").innerHTML = "<span>" + "집합 자료형" + "<br></span>";
      document.getElementById("curri-body9").innerHTML = "<span>" + "변수" + "<br></span>";
      document.getElementById("curri-body10").innerHTML = "<span>" + "if문" + "<br></span>";
      document.getElementById("curri-body11").innerHTML = "<span>" + "while문" + "<br></span>";
      document.getElementById("curri-body12").innerHTML = "<span>" + "for문" + "<br></span>";
      document.getElementById("curri-body13").innerHTML = "<span>" + "함수" + "<br></span>";
      document.getElementById("curri-body14").innerHTML = "<span>" + "사용자 입력과 출력" + "<br></span>";
      document.getElementById("curri-body15").innerHTML = "<span>" + "클래스" + "<br></span>";
      document.getElementById("curri-body16").innerHTML = "<span>" + "모듈" + "<br></span>";
      document.getElementById("curri-body17").innerHTML = "<span>" + "패키지" + "<br></span>";
      document.getElementById("curri-body18").innerHTML = "<span>" + "예외처리" + "<br></span>";
      document.getElementById("curri-body19").innerHTML = "<span>" + "실습" + "<br></span>";
      //과목관련 이미지
      document.getElementById("body_img1").setAttribute("src", "../../../../image/python/2.jpeg")
      document.getElementById("body_img3").setAttribute("src", "../../../../image/python/3.png")
      document.getElementById('body_img2').style.display = 'none'
      document.getElementById('second_img').style.display = 'none'

      //Description
      document.getElementById('body_img1_description_1').innerHTML = "“컴퓨터가 이해할 수 있는 코드는 어느 바보나 다 짤 수 있다. 좋은 프로그래머는 사람이 이해할 수 있는 코드를 짠다”"
      document.getElementById('body_img1_description_2').innerHTML = "- 객체지향 설계자 '마틴 파울러'"
      document.getElementById('body_img1_description_3').style.display = 'none'
      document.getElementById('body_img1_description_4').innerHTML = '데이터 분석(파이썬 심화 과정)'
      }
      else if(sub === "Scatch")
      {
      document.getElementById("image").setAttribute("src","../../../../image/scratch/1.png")
      //과목 소개
      document.getElementById("subject1").innerHTML = "<span>" + "Scratch는 어린이와 초보자를 위해 설계되었으며 프로그래밍을 배우는 재미있고 대화형인 방법을 제공" + "<br></span>";
      document.getElementById("subject2").innerHTML = "<span>" + "블록 기반 프로그래밍 언어로 프로그래밍 개념을 쉽게 배우고 이해 가능" + "<br></span>";
      document.getElementById("subject3").innerHTML = "<span>" + "시각적 프로그래밍 언어로, 블록을 사용하여 프로그램 로직을 만듬" + "<br></span>";
      document.getElementById("subject4").innerHTML = "<span>" + "프로그래밍 개념과 컴퓨터 과학 기술을 재미있고 매력적임" + "<br></span>";
      document.getElementById("subject5").innerHTML = "<span>" + "대화형 프로그래밍을 허용하며, 이는 사용자가 프로그램이 실행되는 동안 프로그램과 상호 작용할 수 있음을 의미" + "<br></span>";
      document.getElementById("subject6").innerHTML = "<span>" + "무료로 사용할 수 있으며 오픈 소스이므로 누구나 소스 코드를 수정 가능" + "<br></span>";
      //특징
      document.getElementById("feature").innerHTML = "<span>" + "새싹과정 이수체계이며 평균 교육과정은 1~3개월입니다." + "<br></span>";
      //커리큘럼
      document.getElementById("curri-body1").innerHTML = "<span>" + "코딩이란? 스크래치란?" + "<br></span>";
      document.getElementById("curri-body2").innerHTML = "<span>" + "스크래치 실행 준비, 인터페이스 소개" + "<br></span>";
      document.getElementById("curri-body3").innerHTML = "<span>" + "스크래치 블록, 스프라이트 움직이기" + "<br></span>";
      document.getElementById("curri-body4").innerHTML = "<span>" + "프로젝트 저장과 열기" + "<br></span>";
      document.getElementById("curri-body5").innerHTML = "<span>" + "말풍선으로 대화 출력" + "<br></span>";
      document.getElementById("curri-body6").innerHTML = "<span>" + "애니메이션 효과 연출" + "<br></span>";
      document.getElementById("curri-body7").innerHTML = "<span>" + "크기, 배경, 모양 바꾸기" + "<br></span>";
      document.getElementById("curri-body8").innerHTML = "<span>" + "소리 추가, 재생하기" + "<br></span>";
      document.getElementById("curri-body9").innerHTML = "<span>" + "펜 기능을 사용하여 작품 출력" + "<br></span>";
      document.getElementById("curri-body10").innerHTML = "<span>" + "제어 블럭" + "<br></span>";
      document.getElementById("curri-body11").innerHTML = "<span>" + "관찰 블럭" + "<br></span>";
      document.getElementById("curri-body12").innerHTML = "<span>" + "방송하기 블럭" + "<br></span>";
      document.getElementById("curri-body13").innerHTML = "<span>" + "연산 블럭" + "<br></span>";
      document.getElementById("curri-body14").innerHTML = "<span>" + "함수" + "<br></span>";
      document.getElementById("curri-body15").innerHTML = "<span>" + "리스트" + "<br></span>";
      document.getElementById("curri-body16").innerHTML = "<span>" + "변수" + "<br></span>";
      //과목관련 이미지
      document.getElementById("body_img1").setAttribute("src", "../../../../image/scratch/2.png")
      document.getElementById("body_img2").setAttribute("src", "../../../../image/scratch/3.png")
      //삭제
      document.getElementById('curri-body17').style.display = 'none'
      document.getElementById('curri-body18').style.display = 'none'
      document.getElementById('curri-body19').style.display = 'none'
      document.getElementById('body_img3').style.display = 'none'
      document.getElementById('third_img').style.display = 'none'
      //Description
      document.getElementById('body_img1_description_1').innerHTML = "“모든 사람들은 코딩하는 법을 배워야 한다. 코딩은 생각하는 법을 가쳐 준다.”"
      document.getElementById('body_img1_description_2').innerHTML = "- 스티브 잡스"
      document.getElementById('body_img1_description_3').innerHTML = "Scatch로 코딩한 게임"
      document.getElementById('body_img1_description_4').style.display = 'none'
      }
      else if(sub === "Entry")
      {
      document.getElementById("image").setAttribute("src","../../../../image/entry/1.png")
      //과목 소개
      document.getElementById("subject1").innerHTML = "<span>" + "소프트웨어 교육을 누구나 쉽게 무료로 받을 수 있도록 개발된 교육용 프로그래밍 언어" + "<br></span>";
      document.getElementById("subject2").innerHTML = "<span>" + "처음 프로그래밍을 배우는 이들이 블록을 쌓는 방식을 통해 프로그래밍 원리는 배우고 이를 바로 확인" + "<br></span>";
      document.getElementById("subject3").innerHTML = "<span>" + "어려운 명령 기호나 문법을 몰라도 조작하기 쉬운 명령어 블록을 순서대로 연결해 조립 가능" + "<br></span>";
      document.getElementById("subject4").innerHTML = "<span>" + "누구나 쉽게 자신만의 게임. 애니메이션, 미디어 아트와 같은 멋진 작품을 만들고 공유" + "<br></span>";
      document.getElementById("subject5").innerHTML = "<span>" + "스크래치와 달리 엔트리는 자바스크립트와 유사한 구문을 사용하는 텍스트 기반 프로그래밍 언어" + "<br></span>";
      document.getElementById("subject6").innerHTML = "<span>" + "엔트리는 교육용으로 설계되었으며 컴퓨터 과학과 프로그래밍 기술을 가르치는 강력한 도구를 제공" + "<br></span>";
      //특징
      document.getElementById("feature").innerHTML = "<span>" + "새싹과정 이수체계이며 평균 교육과정은 1~3개월입니다." + "<br></span>";
      //커리큘럼
      document.getElementById("curri-body1").innerHTML = "<span>" + "코딩이란? ENTRY란?" + "<br></span>";
      document.getElementById("curri-body2").innerHTML = "<span>" + "ENTRY 실행 준비, 인터페이스 소개" + "<br></span>";
      document.getElementById("curri-body3").innerHTML = "<span>" + "ENTRY 블록, 스프라이트 움직이기" + "<br></span>";
      document.getElementById("curri-body4").innerHTML = "<span>" + "프로젝트 저장과 열기" + "<br></span>";
      document.getElementById("curri-body5").innerHTML = "<span>" + "말풍선으로 대화 출력" + "<br></span>";
      document.getElementById("curri-body6").innerHTML = "<span>" + "애니메이션 효과 연출" + "<br></span>";
      document.getElementById("curri-body7").innerHTML = "<span>" + "크기, 배경, 모양 바꾸기" + "<br></span>";
      document.getElementById("curri-body8").innerHTML = "<span>" + "소리 추가, 재생하기" + "<br></span>";
      document.getElementById("curri-body9").innerHTML = "<span>" + "펜 기능을 사용하여 작품 출력" + "<br></span>";
      document.getElementById("curri-body10").innerHTML = "<span>" + "제어 블럭" + "<br></span>";
      document.getElementById("curri-body11").innerHTML = "<span>" + "관찰 블럭" + "<br></span>";
      document.getElementById("curri-body12").innerHTML = "<span>" + "방송하기 블럭" + "<br></span>";
      document.getElementById("curri-body13").innerHTML = "<span>" + "연산 블럭" + "<br></span>";
      document.getElementById("curri-body14").innerHTML = "<span>" + "함수" + "<br></span>";
      document.getElementById("curri-body15").innerHTML = "<span>" + "리스트" + "<br></span>";
      document.getElementById("curri-body16").innerHTML = "<span>" + "변수" + "<br></span>";
      //과목관련 이미지
      document.getElementById("body_img1").setAttribute("src", "../../../../image/entry/2.png")
      document.getElementById("body_img2").setAttribute("src", "../../../../image/entry/3.png")
      //삭제
      document.getElementById('curri-body17').style.display = 'none'
      document.getElementById('curri-body18').style.display = 'none'
      document.getElementById('curri-body19').style.display = 'none'
      document.getElementById('body_img3').style.display = 'none'
      document.getElementById('third_img').style.display = 'none'
      //Description
      document.getElementById('body_img1_description_1').innerHTML = "“비디오 게임을 사지만 말고 직접 만드세요. 휴대폰을 갖고 놀지만 말고 프로그램을 만드세요. 코딩을 배우는 것이 여러분의 미래는 물론 조국의 미래에도 매우 중요합니다.”"
      document.getElementById('body_img1_description_2').innerHTML = "- 버락 오바마"
      document.getElementById('body_img1_description_3').innerHTML = "Entry로 만든 치즈 찾기 게임"
      document.getElementById('body_img1_description_4').style.display = 'Entry로 코딩한 게임'
      }
      else if(sub === "App Inventor")
      {
        document.getElementById("image").setAttribute("src","../../../../image/app_inventor/1.png")
      //과목 소개
      document.getElementById("subject1").innerHTML = "<span>" + "App Inventor는 배우기 쉽고, 자신만의 앱을 만들고 싶어하는 초보자들에게 적합" + "<br></span>";
      document.getElementById("subject2").innerHTML = "<span>" + "스마트폰과 태블릿과 같은 안드로이드 기기용 앱을 만들기 위해 특별히 설계" + "<br></span>";
      document.getElementById("subject3").innerHTML = "<span>" + "불록을 사용하여 앱 로직을 구축하기에 코딩 경험 없이 앱을 만듬" + "<br></span>";
      document.getElementById("subject4").innerHTML = "<span>" + "프로그래밍 개념과 컴퓨터 과학 기술을 가르치는 교육 환경에서 사용" + "<br></span>";
      document.getElementById("subject5").innerHTML = "<span>" + "학생들이 창의성과 혁신뿐만 아니라 문제 해결과 비판적 사고 능력을 개발하는 것을 도움" + "<br></span>";
      document.getElementById("subject6").innerHTML = "<span>" + "트위터와 페이스북과 같은 다양한 웹 서비스와 통합할 수 있으며, 이를 통해 앱에서 더 많은 기능을 사용" + "<br></span>";
      //특징
      document.getElementById("feature").innerHTML = "<span>" + "초급과정 이수체계이며 평균 교육과정은 3~4개월입니다." + "<br></span>";
      //커리큘럼
      document.getElementById("curri-body1").innerHTML = "<span>" + "코딩이란? 앱인벤터란?" + "<br></span>";
      document.getElementById("curri-body2").innerHTML = "<span>" + "앱인벤터 설치 및 준비하기" + "<br></span>";
      document.getElementById("curri-body3").innerHTML = "<span>" + "SW 제작기초 쌓기 1" + "<br></span>";
      document.getElementById("curri-body4").innerHTML = "<span>" + "SW 제작기초 쌓기 2" + "<br></span>";
      document.getElementById("curri-body5").innerHTML = "<span>" + "SW 제작기초 쌓기 3" + "<br></span>";
      document.getElementById("curri-body6").innerHTML = "<span>" + "SW 제작기초 쌓기 4" + "<br></span>";
      document.getElementById("curri-body7").innerHTML = "<span>" + "카메라 기능 활용하기" + "<br></span>";
      document.getElementById("curri-body8").innerHTML = "<span>" + "캔버스 기능 활용하기" + "<br></span>";
      document.getElementById("curri-body9").innerHTML = "<span>" + "위치 센서 기능 활용하기" + "<br></span>";
      document.getElementById("curri-body10").innerHTML = "<span>" + "방향 센서 기능 활용하기" + "<br></span>";
      document.getElementById("curri-body11").innerHTML = "<span>" + "문자 기능 활용하기" + "<br></span>";
      document.getElementById("curri-body12").innerHTML = "<span>" + "공유 기능 활용하기" + "<br></span>";
      document.getElementById("curri-body13").innerHTML = "<span>" + "변수" + "<br></span>";
      document.getElementById("curri-body14").innerHTML = "<span>" + "리스트" + "<br></span>";
      document.getElementById("curri-body15").innerHTML = "<span>" + "TinyDB" + "<br></span>";
      document.getElementById("curri-body16").innerHTML = "<span>" + "조건문" + "<br></span>";
      document.getElementById("curri-body17").innerHTML = "<span>" + "반복문" + "<br></span>";
      document.getElementById("curri-body18").innerHTML = "<span>" + "실전" + "<br></span>";
      //과목관련 이미지
      document.getElementById("body_img1").setAttribute("src", "../../../../image/app_inventor/2.png")
      document.getElementById("body_img2").setAttribute("src", "../../../../image/app_inventor/3.png")
      //삭제
      document.getElementById('curri-body19').style.display = 'none'
      document.getElementById('body_img3').style.display = 'none'
      document.getElementById('third_img').style.display = 'none'
      //Description
      document.getElementById('body_img1_description_1').innerHTML = "“코딩은 사고의 범위를 넓혀주고 더 나은 생각을 할 수 있게 만들며 분야에 상관없이 모든 문제에 대해 새로운 해결책을 생각할 수 있는 힘을 길러 줍니다.”"
      document.getElementById('body_img1_description_2').innerHTML = "- 빌 게이츠(Bill Gates)"
      document.getElementById('body_img1_description_3').innerHTML = "App Inventor 교육 중 일부"
      document.getElementById('body_img1_description_4').style.display = 'none'
      }
      else if(sub === "웹 페이지 만들기")
      {
        document.getElementById("image").setAttribute("src","../../../../image/web/1.png")
      //과목 소개
      document.getElementById("subject1").innerHTML = "<span>" + "HTML(Hypertext Markup Language)은 웹 페이지의 콘텐츠를 구성하고 구성하는 데 사용" + "<br></span>";
      document.getElementById("subject2").innerHTML = "<span>" + "CSS(Cascading Style Sheets)는 글꼴, 색상, 레이아웃을 포함하여 웹 페이지의 내용을 스타일하고 포맷하는 데 사용" + "<br></span>";
      document.getElementById("subject3").innerHTML = "<span>" + "자바스크립트는 동적 양식, 애니메이션, 팝업 메뉴와 같은 대화형 웹 페이지를 만드는 데 사용할 수 있는 프로그래밍 언어" + "<br></span>";
      document.getElementById("subject4").innerHTML = "<span>" + "HTML, CSS, 자바스크립트는 시각적으로 매력적이고 상호작용적인 풍부하고 역동적인 웹 페이지를 만들기 위해 사용" + "<br></span>";
      document.getElementById("subject5").innerHTML = "<span>" + "웹 개발, 게임 개발, 데스크톱 애플리케이션을 포함한 다양한 사용 사례를 가진 다목적 언어" + "<br></span>";
      document.getElementById("subject6").innerHTML = "<span>" + "많은 오픈 소스 라이브러리와 프레임워크를 사용할 수 있는 크고 활발한 개발자 커뮤니티가 많음" + "<br></span>";
      //특징
      document.getElementById("feature").innerHTML = "<span>" + "중급과정 이수체계이며 평균 교육과정은 4~6개월입니다." + "<br></span>";
      //커리큘럼
      document.getElementById("curri-body1").innerHTML = "<span>" + "코딩이란? 웹이란?" + "<br></span>";
      document.getElementById("curri-body2").innerHTML = "<span>" + "웹 개발 설명, 개발환경 설정" + "<br></span>";
      document.getElementById("curri-body3").innerHTML = "<span>" + "HTML 기본 문서 만들기" + "<br></span>";
      document.getElementById("curri-body4").innerHTML = "<span>" + "웹 문서에 다양한 내용 입력" + "<br></span>";
      document.getElementById("curri-body5").innerHTML = "<span>" + "입력 양식 작성하기" + "<br></span>";
      document.getElementById("curri-body6").innerHTML = "<span>" + "CSS의 기본" + "<br></span>";
      document.getElementById("curri-body7").innerHTML = "<span>" + "텍스트를 표현하는 다양한 스타일" + "<br></span>";
      document.getElementById("curri-body8").innerHTML = "<span>" + "레이아웃을 구성하는 CSS박스 모델" + "<br></span>";
      document.getElementById("curri-body9").innerHTML = "<span>" + "이미지와 그라데이션 효과로 배경 꾸미기" + "<br></span>";
      document.getElementById("curri-body9").innerHTML = "<span>" + "CSS 고급 선택자" + "<br></span>";
      document.getElementById("curri-body10").innerHTML = "<span>" + "트랜지션과 애니메이션" + "<br></span>";
      document.getElementById("curri-body11").innerHTML = "<span>" + "반응형 엡과 미디어 쿼리" + "<br></span>";
      document.getElementById("curri-body12").innerHTML = "<span>" + "자바스크립트 기초" + "<br></span>";
      document.getElementById("curri-body13").innerHTML = "<span>" + "자바스크립트 기본 문법" + "<br></span>";
      document.getElementById("curri-body14").innerHTML = "<span>" + "함수와 이벤트" + "<br></span>";
      document.getElementById("curri-body15").innerHTML = "<span>" + "자바스크립트와 객체" + "<br></span>";
      document.getElementById("curri-body16").innerHTML = "<span>" + "문서 객체 모델(DOM)" + "<br></span>";
      document.getElementById("curri-body17").innerHTML = "<span>" + "실습" + "<br></span>";
      //과목관련 이미지
      document.getElementById("body_img1").setAttribute("src", "../../../../image/web/2.png")
      document.getElementById("body_img2").setAttribute("src", "../../../../image/web/3.png")
      //삭제
      document.getElementById('curri-body18').style.display = 'none'
      document.getElementById('curri-body19').style.display = 'none'
      document.getElementById('body_img3').style.display = 'none'
      document.getElementById('third_img').style.display = 'none'
      //Description
      document.getElementById('body_img1_description_1').innerHTML = "“만일 여러분이 코딩을 할 수 있게 된다면, 앉은 자리에서 무엇인가를 만들어 낼 수 있고, 아무도 당신을 막을 수 없을 것입니다.”"
      document.getElementById('body_img1_description_2').innerHTML = "- 페이스북 창립자, 소프트웨어 개발자 마크주커버그"
      document.getElementById('body_img1_description_3').innerHTML = "관련기술로 제작한 코딩나라 홈페이지"
      document.getElementById('body_img1_description_4').style.display = 'none'
      }
      else if(sub === "Minecraft Programming")
      {
        document.getElementById("image").setAttribute("src","../../../../image/minecraft/1.png")
        //과목 소개
      document.getElementById("subject1").innerHTML = "<span>" + "마인크래프트 프로그래밍은 교육 환경에서 프로그래밍 개념과 컴퓨터 과학 기술을 재미있고 매력적인 방식으로 가르치는 데 종종 사용" + "<br></span>";
      document.getElementById("subject2").innerHTML = "<span>" + "블록 기반 프로그래밍 언어를 사용하므로 프로그래밍 개념을 쉽게 배우고 이해" + "<br></span>";
      document.getElementById("subject3").innerHTML = "<span>" + "플레이어가 자신만의 모드, 플러그인, 추가 기능을 만들어 게임 플레이를 커스터마이징 가능" + "<br></span>";
      document.getElementById("subject4").innerHTML = "<span>" + "플레이어 위치와 게임 변수와 같은 게임의 데이터에 액세스할 수 있게 해주며, 이를 통해 더 복잡하고 흥미로운 게임 플레이 메커니즘을 통해 재미 유발" + "<br></span>";
      document.getElementById("subject5").innerHTML = "<span>" + "멀티플레이 허용하며, 이는 플레이어가 같은 게임에서 여러 플레이어가 사용할 수 있는 모드와 플러그인을 만들고 공유가 가능" + "<br></span>";
      document.getElementById("subject6").innerHTML = "<span>" + "파이썬과 자바스크립트와 같은 다른 프로그래밍 언어와 통합될 수 있으며, 이는 훨씬 더 많은 사용자 정의와 복잡성을 가능하게 함" + "<br></span>";
      //특징
      document.getElementById("feature").innerHTML = "<span>" + "고급과정 이수체계이며 평균 교육과정은 6~8개월입니다." + "<br></span>";
      //커리큘럼
      document.getElementById("curri-body1").innerHTML = "<span>" + "코딩이란? 마인크래프트코딩이란?" + "<br></span>";
      document.getElementById("curri-body2").innerHTML = "<span>" + "마인크래프트와 파이썬, 마인크래프트 설치, 파이썬 설치" + "<br></span>";
      document.getElementById("curri-body3").innerHTML = "<span>" + "서버설정" + "<br></span>";
      document.getElementById("curri-body4").innerHTML = "<span>" + "MCPI 설치" + "<br></span>";
      document.getElementById("curri-body5").innerHTML = "<span>" + "멀티플레이로 MCPI 실행" + "<br></span>";
      document.getElementById("curri-body6").innerHTML = "<span>" + "게임 접속" + "<br></span>";
      document.getElementById("curri-body7").innerHTML = "<span>" + "게임 인터페이스" + "<br></span>";
      document.getElementById("curri-body8").innerHTML = "<span>" + "게임 단축키" + "<br></span>";
      document.getElementById("curri-body9").innerHTML = "<span>" + "명령어" + "<br></span>";
      document.getElementById("curri-body10").innerHTML = "<span>" + "파이썬 마인크래프트 연결" + "<br></span>";
      document.getElementById("curri-body11").innerHTML = "<span>" + "초급 텔레포트" + "<br></span>";
      document.getElementById("curri-body12").innerHTML = "<span>" + "고급 텔레포트" + "<br></span>";
      document.getElementById("curri-body13").innerHTML = "<span>" + "자동 건축" + "<br></span>";
      document.getElementById("curri-body14").innerHTML = "<span>" + "자연어 처리" + "<br></span>";
      document.getElementById("curri-body15").innerHTML = "<span>" + "서버설정" + "<br></span>";
      document.getElementById("curri-body16").innerHTML = "<span>" + "건축 프로젝트" + "<br></span>";
      document.getElementById("curri-body17").innerHTML = "<span>" + "AI 프로젝트" + "<br></span>";
      //과목관련 이미지
      document.getElementById("body_img1").setAttribute("src", "../../../../image/minecraft/2.png")
      document.getElementById("body_img2").setAttribute("src", "../../../../image/minecraft/3.png")
      //삭제
      document.getElementById('curri-body18').style.display = 'none'
      document.getElementById('curri-body19').style.display = 'none'
      document.getElementById('body_img3').style.display = 'none'
      document.getElementById('third_img').style.display = 'none'
      //Description
      document.getElementById('body_img1_description_1').innerHTML = "“13살 때, 처음으로 프로그램 만드는 것을 배웠습니다. 저는 프로그래밍을 통해 세계적인 회사를 일궈냈습니다.”"
      document.getElementById('body_img1_description_2').innerHTML = "- 빌 게이츠(Bill Gates)"
      document.getElementById('body_img1_description_3').innerHTML = "Minecraft 코드 빌더를 통한 교육 일부"
      document.getElementById('body_img1_description_4').style.display = 'none'
      }
}