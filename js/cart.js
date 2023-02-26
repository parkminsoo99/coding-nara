
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
        //AJAX 서버 업데이트 전송
        document.querySelectorAll(".information").forEach(function (item){
            if(item.parentElement.previousElementSibling.previousElementSibling.firstElementChild.checked == true){
                var str = item.firstElementChild.nextElementSibling.nextElementSibling.innerText;
                var str_split = str.split(' ');
                var subject = item.firstElementChild.innerText;
                var instructor_name = item.firstElementChild.nextElementSibling.innerText;
                var time = str_split[0];
                var day = str_split[1];
                $.ajax({
                    type: "post", 
                    url: "/enroll/enroll_cart_delete",
                    dataType: "json",
                    data: {
                        Subject: subject,
                        Instructor_name : instructor_name,
                        Time : time,
                        Day : day,
                    }
                })
                document.querySelectorAll("input[name=buy]:checked").forEach(function (item) {
                    item.parentElement.parentElement.remove();
                });
            }
        })
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
          $.ajax({
            type: "post", 
            url: "/enroll/enroll_cart_all_delete",
          })
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
                window.location.href = "https://coding-nara.com/enroll/sub";
            } else {
                // IMP.request_pay(param, callback) 결제창 호출
                IMP.request_pay(
                {
                    pg: "html5_inicis.MOI6344006",
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
                        window.location.href =
                        "https://coding-nara.com/myinfo"
                    } else {
                        var msg = "결제에 실패하였습니다.";
                        msg += "에러내용 : " + rsp.error_msg;
                        window.location.href =
                        "https://coding-nara.com/enroll/cart"
                    }
                    } else {
                    alert("결제를 취소하거나 잘못된 결제입니다.");
                    window.location.href =
                        "https://coding-nara.com/enroll/cart"
                    }
                }
            );}
        }, 300);
    },
    reload : function(){
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
function Show_Cart_Course_info(Subject,i){
    var sub = Subject;
    if(sub === "C언어")
    {
        document.getElementById("image"+i).setAttribute("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAADwCAMAAABCI8pNAAAAllBMVEX///9lmdIBQ4AAWJwARYBfkskAPHpnndV+ptIARYpklMcAU5ZmmNNtmMcAN3MAM3EAS455ocoAOXkALWtBZo8AOnGEqM0LRXaPprlPjspsiaUiTnt3oc8AT4orVoSMrtEAP3MqZZxGgLpRcZAhZ6Zwl7Zefp5/lahaibBFcZoydbQwa5tIeaAANnp9pcEHVoqbqL44danLktuoAAALZUlEQVR4nO2ci3baOBCGgdhySoyd2DgQSAhpmwttmu2+/8utZRtfQJZmpJEwe/jP2d10W4w/69dImhl3NLrooosuuuiiiy4apK6vn099C4Sa+b4/5vL96anvhUTTEqfS/wDqrgOUK/Rnp74nIz0fApUjdXfq+9LXbByKkMbjc3Xfo3CIKp2j++5lQGfpvqkciMeJ83LfTDFEZwd157eiQk+AKH/vXAJ6BSRjaUGdwTYJ5rlGgx8oVZwTQg069qnjnBhqsO7Deq6lYca+a30gPlCPp77/Y1WeA8U5MdT9qRG6mpmM0F5Dcp90gypTuB/UoGQaTED3Q327HWgYAX1qMH+OFA7AfZ39HIlOvZ3QXFulCk8Z+0jinEinct9R8odQp3HflHoSHUA5d9/MLhCXW/fZ9FxL7twnTjjakKuVl3wlkkI5AJo5JXKQRtI5iJvKrvtsbBbUsjhQBgdxQ1laeU/huRaUBfdZ289BRe2+3krRuUKd1nON6Nx3mjgn1JQkiTkIzzUydx/9Qdz0eqYB3YLnjB+RUQGHbm0Nec6OarwDbfeZH4pCnnv0/el0Vmk65b0qBHB6sc/ccznMo+C4ff84K8AML452n2lmwZ/OpMmD58epqQlw7jP0nA8rrZhSYWKfked8zDfNfLOq1LV9oBDvcbOhAh3kTb5Br9tuNq0eB14hJN9nsFsItdd1kwVwqmLyq+qVzrV1gQoofSaF1fWflnGhX2sKF5aSzqdHbSCCgrj+yiHzB/ai+3lHdN7UjLXBw0fvJXUNTXbY1BmoYPzr6lvvFfVGnrRsgr2FIPj+8+bqtm+YsINU2o44c4MzX/CQA+W6JXpCNoiKBwtdR4LgVwFEiqS/uvYLPKGCh6vbkujqpsd5GkhWmpmeQTuY3HN7oBzpRXilezyRpZoCoCaXx7mbq5bEzrseCpGaqYxzbYnDOBrJZt2ny3QQL/ZxjhzJaiVLMk7cc4dENEiWy913fUDB96sjIBok610J4s4KgeeokBxUugX7iMM4R4nkonZ/tE5yz92KicyRQjctFl3rddZWciRH7T3tENE3iYiQnNiOq55OueeOAzclkru+Mr8Ckg+ROZLDrrK7UO05AiRntuPiSTjh2kqJFLp9O2J8uEG1gOR0kEYjEJAZUqgRG555kWw6nYkKaAr9hhEZIWEH6dFv1VtCXKlm9PkNSGSEhMoTi9MIUKqv2/7dAiESJoD3vzADgnqBAxkhwQdJ/taZsiT+cQv1nCESfCYp69fSS309YYbICAm6A4f0hkkG6jcSyAAJOkj7LbSiZ6NnYiI9Z4YEDA7gvLboEaE9Z4YECw5TcFZb0FuMinPmSDDfoQogB0w6njNCAi2RcKLwkOn1SRNIGymE+A7xjkl48Jz+0fOcCRKsEwTdN1E9qM9v+kBWkab4vonisq+I/RwhEuDsp1HQKa6rGeeMkQCDpFUR//6iG+dMkQC+u0NPpCL5YwykiwTYOqAHSVhYcYekXpX6Cii9QOLCijsk9aqEHKTggQpIF0lJhEMKxsDkjz0kdXTAbO54FwYhkS0keK9M0OrCGDQS2He0nrOI9AwFCn7RhQUjJOWyBJtK9J7TR1IuS6DWaEhhZWhIcqCxBc/pIynfBVBGB8LNwkCQbHnuZEjUa+vJkfI4ZxNIE0lZ7pIg5Wsrm5if84iRQu1RCvOw4LFJrv+N8YKHpwIol2cNSmuU0OtSmSoKwp+ME3ke/5c199nZEImW2tpzHIf/k0MNB0m5bRXs8Vqeq7DywbLiPkuHiyOg8QvrEBX+y0fLgvucnJfytZX7rDBczbP/idx9Lk613HNVSBDIo3afJaRWzot7ToTSIqR1n+0MEfccO4Y4/BWl+/SQ1G8aTyug750454mJ+E90A2UrgVzULQKfe044g45NSOY+a2l+P8zPrR4D8VRUTwNHeh5zzyGI+J+9oUiv2Ksv/cPaqw8Qiv2r1epAgQQoqL8lKJxCbDMafYAb7wiRQlitdosbIT6gUfFBw9KmzYp6DLdd6dB4VX4Q01BIhgTqt1nFqHEqbFcJ3vZJhwTqipqzZgT6Bqf5TbZufxbftGaKBIl5o9G6Z3dXI5VExTFjknU/+6XboaKNBGuKXiiYSq5iuOKjD2s2Rtnux9skjbUEBqz/F9uKPq3lPutdk/NYNp32/z9Ziz+t02So39sKfd9ilVZzRaL4R+/HP9AHDxcdyOtYvtdj2VL2caz79JEQb1ysYskZg6X9Q1QK6T5H3fzzNBLbj6VzwMc/viGgtJEC5Etzq0VcB3Sv5snegB9HuM/lmzGfiyyOeDqPTRiL4mixQ3wY7j6jV7I0Xql9/ZyvF4v1fPeK/ugHkMkAKQh+SSMVuYAdr/pziSd/MuGnLWnDYGkkXaTAf8mnRKKKv5RKJ7Akph5SkfzhMSt1R5SVsVI9obSQqoQjX2cWroh2bB/9VQOlgVQkuaulxUugC4up0vL7+GNU1AXQSEWSu3VecGS9bNJC8qTuwyIdJLknR4dRO9q0S6KcSzJQOKQyyd1safgzY5BNmqHqnGBTpeqPfRikPM5NunWIorIXW59OS2GqyfwvGjksrFSPK+eK3y0jZcc8ktgHReJvDxzVj/c/RHaJtkdfWEsEBUQKxv9OJMc4qyGizpx1sn4Vo2BKgZAOPCcAs8i0qVZ1YQFbFPsgSHWc65c4Z0VG1C9BP4gY6b4zRC8KHpvjBMht5itvB+pGfKXmNb6m80chK9uILey72+67+S1HCvzDzYKE6YucCF76aNx323Nerv7Sn6LzB1ydTFe0QF8xpjK6d1/f3wh6XQBxz2HKrTHp3ugtrQYAdgf7o9RT3/V8/paUqjx0cE3PY4THp3lU3mi5TZV+b/3jTb/v+N8M8rNihz2h6j8swmd+hFpuW/tjyFMt/4h30+e7XAnzEEg10yTe9F8Trh2yJlrfaCKZz3PW224mvy7LjKPEcotuMNjf6FZ23Sp9gW3HyPWnp1gE1QY9RLWOS4kdxR18gJo/auK+eQxeCY+JFMecZRFE8YPE0VikGc9/6AN5nvowuowxjVodJF6V0LDfPE3Km9NiiiGTGOvq7r2kW1SgeF2n5UKohxQB18SvBSr2eM0yUvyUpHNoJeBHvK+9aw0Ri+CP7y1Cm7vF5bEkmitTE++7KBakNRBCTt2izF9tS4BNnR2xKN7uerHed9sY/9Ta3+ZNIvS0XVbu05u0JVYcZdvN52pZ+3C5fP2cL7LD4dG5NsJzjd7Mv5h/N4uiOKqU/3D0ygJevFEHUx5ta17HPoOxsqDYYKeyzCr3DQmJpWZZ0bfU1CiUT4NfC9QzIddc0TmjuAXSAc4nEcl5s4h9mjcma13TUJIRHTZHq6xdFzGU/iVYRFn4LvbKqnyALVVfSnN0bmmNSkbRK9lSea7Ra9SeUo7pmKUS3Y+0JnFMRO65Rmv9BIGBki19lrrRKtZ4T8RMLLVdFt6lbokseq7Rwr776imbyJt6yfSe2XGfdxh8bMU5kTQO8iCkbiClrYkotUHnMCFI7V8lC7ftmXwzG9lZnMqr6h3ETfUW2UHiTJKXF+zKIDUvVeKsh/FYy+wPPRCjLv8iRZNGaovgIG6q/b6PJlgkTlu2+1SV70yQvOoFQQaqQ7jQW8bMoKpF9mRxTqTyTTmDccqFT3LbVb7ymgExsuQPnVaZQeyjTf7Qaa59lDJJctuV5r4vymy3/ppohT91sEHFOZHqAo6kfOi16rPD9Vyj5RaxmU0MCyuuVLmv6ZrqlfLt2uForhqo8lB0Bp5raa3MuCSL8/Bco3f5yssid8kfOvU2O3nOkz906ivguE/+0GkZCaaUy4SjDfEUenegUhdJbrvatNsMWHrGnmtpt2B/uJLEO9eoINDfv39PfQsXXXTRRRdddBGN/gPaGwcbpNwESAAAAABJRU5ErkJggg==");
    }
    else if(sub === "Python"){
        document.getElementById("image"+i).setAttribute("src",'../image/python/1.png');
    }
    else if(sub === "Scatch"){
        document.getElementById("image"+i).setAttribute("src",'../image/scratch/1.png');
    }
    else if(sub === "Entry"){
        document.getElementById("image"+i).setAttribute("src",'../image/entry/1.png');
    }
    else if(sub === "App Inventor"){
        document.getElementById("image"+i).setAttribute("src",'../image/app_inventor/1.png');
    }
    else if(sub === "웹 페이지 만들기"){
        document.getElementById("image"+i).setAttribute("src",'../image/web/1.png');
    }
    else if(sub === "Minecraft Programming"){
        document.getElementById("image"+i).setAttribute("src",'../image/minecraft/1.png');
    }
}
