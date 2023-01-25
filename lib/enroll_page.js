var express = require('express');
var router = express.Router();
var template = require('./template');
const app = express()
var db = require('../db');
var authCheck = require('../lib_login/authCheck.js');
var template_main = require('../lib_login/template.js');
var url = require('url');
var sanitizeHtml = require('sanitize-html');
var Tokens = require("csrf");
var tokens = new Tokens();


router.get('/sub', (req, res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
    var Title = 'Enroll';
    var html = template_main.HTML(Title,
        `
        <form action = "/enroll/sub_result" method="get">
            <table border="1">
                <tr>
                    <td id> 강의유형 </td>
                    <td>
                        <input type="checkbox" id="Course_type" name="Course_type" value="1" checked><label for="C">C</label>
                        <input type="checkbox" id="Course_type" name="Course_type" value="2"><label for="Python">Python</label>
                        <input type="checkbox" id="Course_type" name="Course_type" value="3"><label for="Mincraft Programming">Mincraft Programming</label>
                        <input type="checkbox" id="Course_type" name="Course_type" value="4"><label for="App_Inventor">App Inventor</label>
                        <input type="checkbox" id="Course_type" name="Course_type" value="5"><label for="Scatch">Scatch</label>
                        <input type="checkbox" id="Course_type" name="Course_type" value="6"><label for="Entry">Entry</label>
                        <input type="checkbox" id="Course_type" name="Course_type" value="7"><label for="Make_Web">웹 페이지 만들기</label>
                    </td>
                </tr>
                <tr>
                    <td> 강의요일 </td>
                    <td>
                        <input type="checkbox" name="Course_day" id="Course_day" value="1" checked><label for="Monday">월요일</label>
                        <input type="checkbox" name="Course_day" id="Course_day" value="2"><label for="Tuesday">화요일</label>
                        <input type="checkbox" name="Course_day" id="Course_day" value="3" ><label for="Wednesday">수요일</label>
                        <input type="checkbox" name="Course_day" id="Course_day" value="4" ><label for="Thursday">목요일</label>
                        <input type="checkbox" name="Course_day" id="Course_day" value="5" ><label for="Friday">금요일</label>
                        <input type="checkbox" name="Course_day" id="Course_day" value="6" ><label for="Saturday">토요일</label>
                        <input type="checkbox" name="Course_day" id="Course_day" value="7" ><label for="Sunday">일요일</label>
                    </td>
                </tr>
                <tr>
                    <td> 강의시간 </td>
                    <td>
                    <input type="checkbox" id="Course_time" name="Course_time" value="1" checked><label for="Time_1">07:00~08:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="2"><label for="Time_2">08:00~09:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="3"><label for="Time_3">09:00~10:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="4"><label for="Time_4">10:00~11:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="5"><label for="Time_5">11:00~12:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="6"><label for="Time_6">12:00~13:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="7"><label for="Time_7">13:00~14:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="8"><label for="Time_8">14:00~15:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="9"><label for="Time_9">15:00~16:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="10"><label for="Time_10">16:00~17:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="11"><label for="Time_11">17:00~18:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="12"><label for="Time_12">18:00~19:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="13"><label for="Time_13">19:00~20:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="14"><label for="Time_14">20:00~21:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="15"><label for="Time_15">21:00~22:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="16"><label for="Time_16">22:00~23:00</label>
                    <input type="checkbox" id="Course_time" name="Course_time" value="17"><label for="Time_17">23:00~00:00</label>
                    </td>
                </tr>
            </table>
            </br>
            <input type="submit" value="검색"></input>
        </form>
        `,   
        authCheck.statusUI(req, res)
    );
    res.send(html);	
    }
})

router.get('/sub_result', (req, res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        var dataList=[];
        for(let a=0; a<req.query.Course_type.length; a++){
            for(let b=0; b<req.query.Course_day.length; b++){
                for(let c=0; c<req.query.Course_time.length; c++){
                    db.query(`select * from Instructor left join (select * from Instructor_Time_Date where Course_Active = 0) AS Temp  on Instructor.Teacher_ID = Temp.Teacher_ID left join Instructor_DATE AS ID on ID.Date_ID = Temp.Date_ID left join Instructor_TIME AS IT on IT.TIME_ID = Temp.TIME_ID  left join Course AS C on Temp.Course_ID = C.Course_ID 
                    Where Temp.Course_ID = ? and Temp.TIME_ID = ? and Temp.Date_ID = ?;`,[Number(req.query.Course_type[a]), Number(req.query.Course_day[b]),Number(req.query.Course_time[c])],
                    function(error2, Instructor){
                        if(error2) throw error2;
                        if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
                            res.redirect('/auth/login');
                            return false;
                        }else {
                            for(var data of Instructor) dataList.push(data);
                        }
                        }	
                    )
                }
            }
        }
        setTimeout(function(){
        var enroll_list = template.Enroll_list(dataList);
        var html = template.HTML('수강신청페이지입니다.',enroll_list,
            `
            <form action = "/enroll/sub_result" method="get">
                <table border="1">
                    <tr>
                        <td id> 강의유형 </td>
                        <td>
                            <input type="checkbox" id="Course_type" name="Course_type" value="1" checked><label for="C">C</label>
                            <input type="checkbox" id="Course_type" name="Course_type" value="2"><label for="JAVA">JAVA</label>
                            <input type="checkbox" id="Course_type" name="Course_type" value="3"><label for="Python">Python</label>
                            <input type="checkbox" id="Course_type" name="Course_type" value="4"><label for="App_Inventor">App Inventor</label>
                            <input type="checkbox" id="Course_type" name="Course_type" value="5"><label for="Scatch">Scatch</label>
                            <input type="checkbox" id="Course_type" name="Course_type" value="6"><label for="Entry">Entry</label>
                            <input type="checkbox" id="Course_type" name="Course_type" value="7"><label for="Make_Web">웹 페이지 만들기</label>
                        </td>
                    </tr>
                    <tr>
                        <td> 강의요일 </td>
                        <td>
                            <input type="checkbox" name="Course_day" id="Course_day" value="1" checked><label for="Monday">월요일</label>
                            <input type="checkbox" name="Course_day" id="Course_day" value="2"><label for="Tuesday">화요일</label>
                            <input type="checkbox" name="Course_day" id="Course_day" value="3" ><label for="Wednesday">수요일</label>
                            <input type="checkbox" name="Course_day" id="Course_day" value="4" ><label for="Thursday">목요일</label>
                            <input type="checkbox" name="Course_day" id="Course_day" value="5" ><label for="Friday">금요일</label>
                            <input type="checkbox" name="Course_day" id="Course_day" value="6" ><label for="Saturday">토요일</label>
                            <input type="checkbox" name="Course_day" id="Course_day" value="7" ><label for="Sunday">일요일</label>
                        </td>
                    </tr>
                    <tr>
                        <td> 강의시간 </td>
                        <td>
                        <input type="checkbox" id="Course_time" name="Course_time" value="1" checked><label for="Time_1">07:00~08:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="2"><label for="Time_2">08:00~09:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="3"><label for="Time_3">09:00~10:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="4"><label for="Time_4">10:00~11:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="5"><label for="Time_5">11:00~12:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="6"><label for="Time_6">12:00~13:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="7"><label for="Time_7">13:00~14:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="8"><label for="Time_8">14:00~15:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="9"><label for="Time_9">15:00~16:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="10"><label for="Time_10">16:00~17:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="11"><label for="Time_11">17:00~18:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="12"><label for="Time_12">18:00~19:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="13"><label for="Time_13">19:00~20:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="14"><label for="Time_14">20:00~21:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="15"><label for="Time_15">21:00~22:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="16"><label for="Time_16">22:00~23:00</label>
                        <input type="checkbox" id="Course_time" name="Course_time" value="17"><label for="Time_17">23:00~00:00</label>
                        </td>
                    </tr>
                </table>
                </br>
                <input type="submit" value="검색"></input>
            </form>	
            `,'',  
            authCheck.statusUI(req, res)
        );
        res.send(html);	
        },200)
    }
})

 router.get('/:TeacherId/:CourseId/:DateId/:TIMEId', (req,res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
            res.redirect('/auth/login');
            return false;
        }else {
            var post = req.body;
            console.log('post',post);
            var Student = req.session.email;
            var Course_Id = req.params.CourseId;
            var Date_Id = req.params.DateId;
            var Time_Id = req.params.TIMEId;
            var Teacher_Id = req.params.TeacherId;
            res.cookie('cookieName', 'cookieValue',{maxAge:3000, httpOnly: true,  secure: true, SameSite:'Strict'})
            db.query(
                `
                select C.Subject, price from Course AS C left join Course_Price AS CP on C.subject = CP.subject where C.Course_ID = ?; 
                select * from Student where Email_Address = ?; 
                select * from Instructor_Time_Date where Teacher_ID = ? and Course_ID = ? and DATE_ID = ? and TIME_ID;
                `,[Course_Id, Student, Teacher_Id, Course_Id, Date_Id, Time_Id],
                (error, result) => {
                if(error) throw error;
                    console.log('result',result)
                    var html = template_main.HTML('수강신청페이지입니다.',
                        `
                            <div class="count_button">
                            <button onclick="countDown();price_change();"><</button>
                            <span>현재 카운트 : <string id="count">1</string></span>
                            <button onclick="countUp();price_change();">></button>
                            <button onclick="countRset();">초기화</button>
                            </div>
                            <div class="price_div">
                            <p>가격 : <string id="price"></string><span>원</span></p>
                            </div>
                            <div class="point_div">
                            <p>포인트 잔액 : <string id="point"></string><span>원</span></p>
                            </div>
                            <div class="point_use_div">
                            <p>포인트 사용 : <input type="text" id="point_use" value="0"/><span>원</span><input type="button" value="적용" onClick="cal_result_price()"/></p>
                            <div class="result_price_div">
                            <p>총 결제 금액 : <string id="result_price"></string><span>원</span></p>
                            </div>
                            </div>
                                <button onclick="requestPay()">결제하기</button>
                                <script>
                                var count=1;
                                var price = (${result[0][0].price}).toLocaleString('ko-KR');
                                var point = (${result[1][0].Point}).toLocaleString('ko-KR');
                                var result_price = (${result[0][0].price}).toLocaleString('ko-KR');
                                var discount_price=0;
                                const input = document.querySelector(('#point_use'));
                                input.addEventListener('keyup', function(e) {
                                let value = e.target.value;
                                value = Number(value.replaceAll(',', ''));
                                if(isNaN(value)) input.value = 0;
                                else {
                                    const formatValue = value.toLocaleString('ko-KR');
                                    input.value = formatValue;
                                }
                                })
                                function price_show(){
                                document.querySelector("#price").innerText=price;
                                }
                                price_show();
                                function result_price_show(){
                                document.querySelector("#result_price").innerText=price;
                                }
                                result_price_show();
                        
                                function Point_show(){
                                document.querySelector("#point").innerText=point;
                                
                                }
                                Point_show();
                                function cal_result_price(){
                                discount_price = document.getElementById('point_use').value;
                                discount_price = Number(discount_price.replaceAll(',', ''));
                                if(discount_price <= ${result[1][0].Point}) {
                                    result_price = ((count * ${result[0][0].price}) - discount_price);
                                    document.querySelector("#result_price").innerText=result_price.toLocaleString('ko-KR');
                                }
                                else alert("포인트 초과");
                                }
                                var price_change = function(){
                                price = (count * ${result[0][0].price}).toLocaleString('ko-KR');
                                document.querySelector("#price").innerText=price;
                                document.querySelector("#result_price").innerText=price;
                                
                                }
                                var countUp=function(){
                                    count=count+1;
                                    document.querySelector("#count").innerText=count;
                                };
                                var countDown=function(){
                                if(count>1){
                                    count=count-1;        
                                    document.querySelector("#count").innerText=count;
                                }
                                };
                                var countRset=function(){
                                    count=1;
                                    price = (count * ${result[0][0].price}).toLocaleString('ko-KR');
                                    document.querySelector("#price").innerText=price;
                                    document.querySelector("#count").innerText=count;
                                };
                                const IMP = window.IMP;
                                IMP.init('imp71467660');
                                const make_merchant_uid = () => {
                                    const current_time = new Date();
                                    const year = current_time.getFullYear().toString();
                                    const month = (current_time.getMonth()+1).toString();
                                    const day = current_time.getDate().toString();
                                    const hour = current_time.getHours().toString();
                                    const minute = current_time.getMinutes().toString();
                                    const second = current_time.getSeconds().toString();
                                    const merchant_uid = 'MIHEE' + year + month + day + hour + minute + second;
                                    return merchant_uid;
                                };
                                const merchant_uid = make_merchant_uid()
                                
                                function requestPay() {
                                    if(${result[2][0].Course_Active} == 1){
                                        alert("이미 결제가 이뤄진 강의입니다.");
                                        window.location.href="http://localhost:3000/enroll/sub";
                                    }else{
                                        // IMP.request_pay(param, callback) 결제창 호출
                                        IMP.request_pay({
                                        pg: 'html5_inicis.INIpayTest', // version 1.1.0부터 지원.
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
                                        pay_method: 'card',
                                        /* 
                                            'samsung':삼성페이, 
                                            'card':신용카드, 
                                            'trans':실시간계좌이체,
                                            'vbank':가상계좌,
                                            'phone':휴대폰소액결제 
                                        */
                                        merchant_uid: merchant_uid,
                                        /* 
                                            merchant_uid에 경우 
                                            https://docs.iamport.kr/implementation/payment
                                            위에 url에 따라가시면 넣을 수 있는 방법이 있습니다.
                                            참고하세요. 
                                            나중에 포스팅 해볼게요.
                                            */
                                        name: '${result[0][0].Subject}',
                                        //결제창에서 보여질 이름
                                        amount: 100,//result_price,
                                        //가격 
                                        buyer_email: '${result[1][0].Email_Address}',
                                        buyer_name: '${result[1][0].Name}',
                                        buyer_tel: '${result[1][0].Phone_Number}',
                                        buyer_addr: '${result[1][0].Address}',
                                        buyer_postcode: '${result[1][0].Recommand_ID}',
                                        /*  
                                            모바일 결제시,
                                            결제가 끝나고 랜딩되는 URL을 지정 
                                            (카카오페이, 페이코, 다날의 경우는 필요없음. PC와 마찬가지로 callback함수로 결과가 떨어짐) 
                                            */
                                    }, 
                                    function (rsp) {
                                        if(rsp.status == 'paid' && rsp.paid_amount == 100){
                                            if (rsp.success) {
                                                console.log(rsp);
                                                var count_num = document.getElementById("count").textContent;
                                                var original_price = document.getElementById("price").textContent;
                                                var final_price = document.getElementById("result_price").textContent;
                                                discount_price = document.getElementById('point_use').value;
                                                discount_price = Number(discount_price.replaceAll(',', ''));
                                                original_price = Number(original_price.replaceAll(',', ''));
                                                final_price = Number(final_price.replaceAll(',', ''));
                                                var msg = '결제가 완료되었습니다.';
                                                msg += '고유ID : ' + rsp.imp_uid;
                                                msg += '상점 거래ID : ' + rsp.merchant_uid;
                                                msg += '결제 금액 : ' + rsp.paid_amount;
                                                msg += '카드 승인번호 : ' + rsp.apply_num;
                                                alert(msg);
                                                window.location.href = 'http://localhost:3000/enroll/payment/complete?point='+ discount_price + "&course_id=" + ${sanitizeHtml(Course_Id)} + "&time_id=" + ${sanitizeHtml(Time_Id)} + "&date_id=" + ${sanitizeHtml(Date_Id)} + "&teacher_id=" + ${sanitizeHtml(Teacher_Id)} + "&count=" + count_num + "&merchant_uid=" + rsp.merchant_uid + "&original_price=" + original_price + "&final_price=" + final_price;
                                                } 
                                                else {
                                                    var msg = '결제에 실패하였습니다.';
                                                    msg += '에러내용 : ' + rsp.error_msg;
                                                    alert(msg);
                                                }     
                                            }
                                            else{
                                                alert("위조")
                                            }
                                        });
                                    }
                                }
                            </script>
                        `,
                        authCheck.statusUI(req, res)
                    );
                res.send(html);	
            })
        }
    }   
})

 router.get('/payment/complete/',(req,res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
            res.redirect('/auth/login');
            return false;
        }else {
            var queryData = url.parse(req.url, true).query;
            console.log('queryData', queryData);
            db.query(
                `update Student set Point = Point - ? where Email_Address = ?;
                update Instructor_Time_Date set Course_Active = 1 where Teacher_ID = ? and TIME_ID = ? and Date_ID = ? and Course_ID = ? ;
                insert into Section(Student_ID, Teacher_ID, Course_ID, DATE_ID, TIME_ID, Increase_Count, Decrease_Count, Max_Count) values(?,?,?,?,?,0,?,?);
                insert into Payment(Order_ID, Student_ID, Teacher_ID, DATE_ID, TIME_ID, Course_ID, Original_price, Discount_price, Final_price) value(?,?,?,?,?,?,?,?,?);
                `,[queryData.point,req.session.email
                , queryData.teacher_id, queryData.time_id, queryData.date_id, queryData.course_id
                , req.session.Student_Id, queryData.teacher_id , queryData.course_id, queryData.date_id, queryData.time_id, queryData.count, queryData.count
                , queryData.merchant_uid, req.session.Student_Id, queryData.teacher_id, queryData.date_id, queryData.time_id, queryData.course_id, queryData.original_price, queryData.point, queryData.final_price
            ],
            function(error, result){
            if(error) throw error;
            console.log('payment',result);
            res.redirect('/');
            });
        }
    }
 })
 module.exports = router;