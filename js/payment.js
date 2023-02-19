
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