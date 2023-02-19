
let basket = {
    totalCount: 0, 
    totalPrice: 0,
    totalPoint: 0,
    original_price : 0,
    count :0,
    Constructor : function() {
        var op = document.getElementById('point');
        op = Number(op.innerText.replaceAll(",", ""));
        this.original_price = op;
    },
    
        //체크한 장바구니 상품 비우기
    delCheckedItem: function(){
        document.querySelectorAll("input[name=buy]:checked").forEach(function (item) {
            item.parentElement.parentElement.remove();
        });
        //AJAX 서버 업데이트 전송
    
        //전송 처리 결과가 성공이면
        this.reCalc(this.original_price);
        this.updateUI();
    },
    //장바구니 전체 비우기
    delAllItem: function(){
        document.querySelectorAll('.cart__list__detail').forEach(function (item) {
            item.remove();
          });
          //AJAX 서버 업데이트 전송
        
          //전송 처리 결과가 성공이면
          this.totalCount = 0;
          this.totalPrice = 0;
          this.reCalc(this.original_price);
          this.updateUI();
    },
    //재계산
    reCalc: function(inital_point){
        if(this.count == 0) {
            this.original_price = inital_point;
            this.count++;
        }
        this.totalCount = 0;
        this.totalPrice = 0;
        this.totalPoint = inital_point;
        document.querySelectorAll(".p_num").forEach(function (item) {
            if(item.parentElement.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.firstElementChild.checked == true){
                var use_point = item.parentElement.parentElement.parentElement.nextElementSibling.firstElementChild.getAttribute('value');
                if(use_point == null) use_point = 0;
                var count = parseInt(item.getAttribute('value'));
                if(isNaN(count)) count = 0;
                this.totalCount += count;
                var price = item.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.getAttribute('value');
                this.totalPrice += count * price 
                if(item.parentElement.parentElement.parentElement.nextElementSibling.firstElementChild.nextElementSibling.disabled == true) {
                    this.totalPoint = parseInt(this.totalPoint) -  parseInt(use_point);
                    this.totalPrice -= use_point;
                }
               
            }
        }, this); 
    },
    Enroll_info : function(imp_uid, merchant_uid){
        document.querySelectorAll(".information").forEach(function (item){
            if(item.parentElement.previousElementSibling.previousElementSibling.firstElementChild.checked == true){
                var str = item.firstElementChild.nextElementSibling.nextElementSibling.innerText;
                var count_position = item.parentElement.nextElementSibling.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling;
                var count = count_position.getAttribute('value');
                var str_split = str.split(' ');
                var subject = item.firstElementChild.innerText;
                var instructor_name = item.firstElementChild.nextElementSibling.innerText;
                var time = str_split[0];
                var day = str_split[1];
                $.ajax({
                    type: "post", 
                    url: "/enroll/cart_payment",
                    dataType: "json",
                    data: {
                        Subject: subject,
                        Instructor_name : instructor_name,
                        Time : time,
                        Day : day,
                        Count : count,
                        Imp_Uid : imp_uid,
                        Merchant_Uid : merchant_uid
                    }
                })
            }
        })
    },
    //화면 업데이트
    updateUI: function () {
        document.querySelector('#sum_p_num').textContent = '총 강의 횟수 : ' + this.totalCount.formatNumber() + '번';
        document.querySelector('#sum_p_price').textContent = '총 합계금액 : ' + this.totalPrice.formatNumber() + '원';
        document.querySelector('#point').textContent = this.totalPoint.formatNumber();
    },
    //개별 수량 변경
    
    checkItem: function () {
        this.reCalc(this.original_price);
        this.updateUI();
    },
    delItem: function () {
        alert(event.target.parentElement.parentElement.parentElement)
        event.target.parentElement.parentElement.parentElement.remove();
        this.reCalc(this.original_price);
        this.updateUI();
    },
    Show : function() {
        this.reCalc();
        this.updateUI();
    },
    Point : function(point){
        var item = document.querySelector('input[name=p_point'+point+']');
        item.addEventListener("keyup", function (e) {
            e.target.value =  e.target.value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');
            item.setAttribute('value',e.target.value);
        })
    },
    changePNum: function (pos) {
        var item = document.querySelector('input[name=p_num'+pos+']');
        item.addEventListener("keyup", function (e) {
            e.target.value =  e.target.value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');
            item.setAttribute('value',e.target.value);
        })
        var p_num = parseInt(item.getAttribute('value'));
        var newval = event.target.classList.contains('up') ? p_num+1 : event.target.classList.contains('down') ? p_num-1 : event.target.value;
        if (parseInt(newval) < 1 || parseInt(newval) > 99) { return false; }
        item.setAttribute('value', newval);
        item.value = newval;
        var price = item.parentElement.parentElement.previousElementSibling.firstElementChild.getAttribute('value');
        item.parentElement.parentElement.nextElementSibling.textContent = (newval * price).formatNumber()+"원";
        //AJAX 업데이트 전송

        //전송 처리 결과가 성공이면    
        this.reCalc(this.original_price);
        this.updateUI();
    },
    Point_use : function(point){
        var item = document.querySelector('input[name=p_point'+point+']');
        var item_button = document.getElementById('p_point_button'+point)
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
                var str = item.parentElement.previousElementSibling.previousElementSibling.firstElementChild.firstElementChild.nextElementSibling.nextElementSibling.innerText;
                var count_position = item.parentElement.previousElementSibling.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling;
                var count = count_position.getAttribute('value');
                var str_split = str.split(' ');
                var subject =  item.parentElement.previousElementSibling.previousElementSibling.firstElementChild.firstElementChild.innerText;
                var instructor_name =  item.parentElement.previousElementSibling.previousElementSibling.firstElementChild.firstElementChild.nextElementSibling.innerText;
                var time = str_split[0];
                var day = str_split[1];
                $.ajax({
                        type: "post", 
                        url: "/enroll/insert_point",
                        dataType: "json",
                        data: {
                            Subject: subject,
                            Instructor_name : instructor_name,
                            Time : time,
                            Day : day,
                            Count : count,
                            Point : point,
                        }
                    })}
            this.reCalc(this.original_price);
            this.updateUI();
        }
    },
    get_price(){
        document.querySelectorAll(".information").forEach(function (item){
            if(item.parentElement.previousElementSibling.previousElementSibling.firstElementChild.checked == true){
                var str = item.firstElementChild.nextElementSibling.nextElementSibling.innerText;
                var count_position = item.parentElement.nextElementSibling.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling;
                var count = count_position.getAttribute('value');
                var str_split = str.split(' ');
                var subject = item.firstElementChild.innerText;
                var instructor_name = item.firstElementChild.nextElementSibling.innerText;
                var time = str_split[0];
                var day = str_split[1];
                $.ajax({
                    type: "post", 
                    url: "/enroll/save_price",
                    dataType: "json",
                    data: {
                        Subject: subject,
                        Instructor_name : instructor_name,
                        Time : time,
                        Day : day,
                        Count : count,
                    }
                })
            }
        })
    },
    get_result_price_point : function(){
        var price = 0;
        var point = 0;
        var p_point = 0;
        var p_price = 0;
        var nickname = '';
        var email_address = '';
        var phone_number = '';
        var address = '';
        var postcode = 0;
        document.querySelectorAll(".information").forEach(function (item){
            if(item.parentElement.previousElementSibling.previousElementSibling.firstElementChild.checked == true){
                var str = item.firstElementChild.nextElementSibling.nextElementSibling.innerText;
                var count_position = item.parentElement.nextElementSibling.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.nextElementSibling;
                var count = count_position.getAttribute('value');
                var str_split = str.split(' ');
                var subject = item.firstElementChild.innerText;
                var instructor_name = item.firstElementChild.nextElementSibling.innerText;
                var time = str_split[0];
                var day = str_split[1];
                $.ajax({
                    type: "post", 
                    url: "/enroll/get_result_price_point",
                    dataType: "json",
                    async: false, 
                    data: {
                        Subject: subject,
                        Instructor_name : instructor_name,
                        Time : time,
                        Day : day,
                        Count : count,
                    },
                    success: function(data) {
                        price = Number(JSON.stringify(data.result[0].Payment_Price));
                        point = Number(JSON.stringify(data.result[0].Use_Point));
                        p_price += price;
                        p_point += point;
                        nickname = JSON.stringify(data.name);
                        email_address = JSON.stringify(data.email_address);
                        phone_number = JSON.stringify(data.phone_number);
                        address = JSON.stringify(data.address);
                        postcode = Number(JSON.stringify(data.postcode));
                    }
                })
            }
        })
        return ({p_price, p_point, nickname, email_address, phone_number, address, postcode});
    },
    payment : function(Course_Active){
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
        basket.get_price();
        setTimeout(() => {
            var price_point_name = basket.get_result_price_point();
            const reg = /[\{\}\[\]\/?,;:|\)*~`!^\-_+<>\#$%&\\\=\(\'\"]/gi;
            var result_price = JSON.stringify(price_point_name.p_price);
            var payment_name = (JSON.stringify(price_point_name.nickname)).replace(reg, "");
            var email_address = JSON.stringify(price_point_name.email_address).replace(reg, "");
            var phone_number = JSON.stringify(price_point_name.phone_number).replace(reg, "");
            var address = JSON.stringify(price_point_name.address).replace(reg, "");
            var postcode = JSON.stringify(price_point_name.postcode);
            if (Course_Active== 1) {
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
                    amount: 100,//result_price,
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
                        basket.Enroll_info(rsp.imp_uid,rsp.merchant_uid); //결제 완료했을 떄 Section에 추가
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
                        window.location.href =
                        "http://localhost:54213/enroll/cart"
                        alert(msg);
                    }
                    } else {
                    alert("결제를 취소하거나 잘못된 결제입니다.");
                    window.location.href =
                        "http://localhost:54213/enroll/cart"
                    }
                }
            );}
        }, 300);
    },
    reload : function(){
        console.log("[window onload] : [start]");
        document.querySelectorAll(".information").forEach(function (item) {
          var str =
            item.firstElementChild.nextElementSibling.nextElementSibling
              .innerText;
          var count_position =
            item.parentElement.nextElementSibling.firstElementChild
              .nextElementSibling.firstElementChild.firstElementChild
              .nextElementSibling;
          var count = count_position.getAttribute("value");
          var str_split = str.split(" ");
          var subject = item.firstElementChild.innerText;
          var instructor_name =
            item.firstElementChild.nextElementSibling.innerText;
          var time = str_split[0];
          var day = str_split[1];
          console.log("[window onload] : end");
          $.ajax({
            type: "post",
            url: "/enroll/delete_cart",
            dataType: "json",
            data: {
              Subject: subject,
              Instructor_name: instructor_name,
              Time: time,
              Day: day,
              Count: count,
                },
            })
        });
    }
}

// 숫자 3자리 콤마찍기
Number.prototype.formatNumber = function(){
    if(this==0) return 0;
    let regex = /(^[+-]?\d+)(\d{3})/;
    let nstr = (this + '');
    while (regex.test(nstr)) nstr = nstr.replace(regex, '$1' + ',' + '$2');
    return nstr;
};