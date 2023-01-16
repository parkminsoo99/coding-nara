import path from "path";
import SocketIO from "socket.io";
import http from "http";

const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)
const app = express()
const port = 3000
var qs = require('querystring');
var authRouter = require('./lib_login/auth');
var authCheck = require('./lib_login/authCheck.js');
var template_main = require('./lib_login/template.js');
var template = require('./lib/template.js');
var db = require('./db');
const { response } = require('express');
const { Enroll_list } = require('./lib/template.js');
const handleListen = () => console.log("Listen on http://localhost:3000");

const __dirname = path.resolve();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use("/static", express.static(__dirname + "/static"));

app.get("/myinfo/class", (req, res) => {
  res.render("home");
});

app.post("/payments/complete", async (req, res) => {
  try {
    console.log(req.body)
    const { imp_uid, merchant_uid } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
    // 액세스 토큰(access token) 발급 받기
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: "imp_apikey", // REST API 키
        imp_secret: "ekKoeW8RyKuT0zgaZsUtXXTLQ4AhPFW3ZGseDA6bkA5lamv9OqDMnxyeB9wqOsuO9W3Mx9YSJ4dTqJ3f" // REST API Secret
      }
    });
    const { access_token } = getToken.data.response; // 인증 토큰

    // imp_uid로 아임포트 서버에서 결제 정보 조회
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: "get", // GET method
      headers: { "Authorization": access_token } // 인증 토큰 Authorization header에 추가
    });
    const paymentData = getPaymentData.data.response; // 조회한 결제 정보
    const order = await Orders.findById(paymentData.merchant_uid);
    const amountToBePaid = order.amount; // 결제 되어야 하는 금액
    const { amount, status } = paymentData;
    if (amount === amountToBePaid) { // 결제금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
      await Orders.findByIdAndUpdate(merchant_uid, { $set: paymentData }); // DB에 결제 정보 저장
      switch (status) {
        case "ready": // 가상계좌 발급
          // DB에 가상계좌 발급 정보 저장
          const { vbank_num, vbank_date, vbank_name } = paymentData;
          await Users.findByIdAndUpdate("/* 고객 id */", { $set: { vbank_num, vbank_date, vbank_name }});
          // 가상계좌 발급 안내 문자메시지 발송
          SMS.send({ text: `가상계좌 발급이 성공되었습니다. 계좌 정보 ${vbank_num} ${vbank_date} ${vbank_name}`});
          res.send({ status: "vbankIssued", message: "가상계좌 발급 성공" });
          break;
        case "paid": // 결제 완료
          res.send({ status: "success", message: "일반 결제 성공" });
          break;
      }
    } else { // 결제금액 불일치. 위/변조 된 결제
      throw { status: "forgery", message: "위조된 결제시도" };
    }
  } catch (e) {
    res.status(400).send(e);
  }
});
// app.use('/auth',bodyParser.urlencoded({ extended: false }));


app.use(session({
  secret: '~~~',	// 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore({logFn: function(){}}),
}))
app.get('/', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/main');
    return false;
  } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect('/main');
    return false;
  }
})

// // 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.get('/main', (req, res) => {
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
    <p id="title"><h1>실시간 온라인<h2></p>
    <p id="title"><h1>코딩교육을 한곳에서</h1></p>
    <p><h3>우리 아이에 적합한 교육 서비스를 경험해보세요<h3></p>
    <button class="button-arounder" >시작하기</button>
    <p><h1>코딩나라가 제공하는 서비스<h2></p><p><h1></h1></p>
    <div class="container" id="borderDemo">
        <h1>처음 접하는 아이들에게 맞춤교육</h1>
      <div id="bg2">
      </div>
      <h2 id="mg">코딩의 첫걸음을 쉽게 이끌어주도록 도와줍니다</h2>
    </div>
    <p><h1>잘 성립된 커리큘럼</h1><p>
    <div id="bg3" align=center>
      </div>
      <h2 id="mg">단계별로 과목이 나누어져 있으며 아이들에게 맞춰서 진행합니다.</h2>
    <p><h1>1대1로 실시간으로 문제 해결</h1></p>
    <div id="bg4">
      </div>
      <h2 id="mg">처음 접하는 아이들에게 맞춤교육</h2>
    <p><h1>어디서든 들을 수 있는 교육</h1></p>
    <div id="bg5">
      </div>
      <h2 id="mg">처음 접하는 아이들에게 맞춤교육</h2>
    <p><h1>원하는 시간을 선택</h1></p>
    <div id="bg6">
      </div>
    
    <p><h3><h3></p>
    
    
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
  
  }
)
//커리큘럼
app.get('/curriculum', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template_main.HTML('Welcome',
    `<br />
    <div>
  <p>코딩나라</p>
  <ul class="tree">
    <li>초급자
      <ul>
        <li>스크래치</li>
        <li>ENTRY
          <ul>
            <li>Elephant</li>
            <li>Mouse</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>중급자
      <ul>
        <li>앱 인벤터
          <ul>
            <li>웹 사이트 제작</li>
            <li>Python
              <ul>
                <li>List item 1</li>
                <li>List item 2
                  <ul>
                    <li>List item 2.1</li>
                    <li>List item 2.2</li>
                    <li>List item 2.3</li>
                  </ul>
                </li>
                <li>List item 3</li>
                <li>List item 4</li>
                <li>List item 5
                  <ul>
                    <li>List item 5.1</li>
                    <li>List item 5.2
                      <ul>
                        <li>List item 5.2.1</li>
                        <li>List item 5.2.2</li>
                        <li>List item 5.2.3</li>
                        <li>List item 5.2.4</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>List item 6</li>
                <li>List item 7</li>
                <li>List item 8</li>
              </ul>
            </li>
          </ul>
        </li>
        <li>Trees</li>
      </ul>
    </li>
  </ul>
</div>
    `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})



//고객센터
app.get('/ask', (req, res) => {
  // if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있어도 로그인 페이지로 이동시킴
  //   res.redirect('/auth/login');
  //   return false;
  // }
  var html = template_main.ASK('Welcome',
    `<hr>
        <h2>고객센터에 오신 것을 환영합니다</h2>
		<aside class="aside_class">
			<div class="menu">
				<a class="menu_item"><span>가격</span></a>
			</div>
		</aside>
		<div class="question">
			<ul class="question_ul">
				<li class="question_li">
					<a href="/ask/1/" class="question_li_a">"테스트입니다."</a>
				</li>
		</div>
        `,   
    authCheck.statusUI(req, res)
  );
  res.send(html);
})

app.get('/review', (request,response) =>
db.query(`SELECT * FROM Review`, function(error,Reviews){
    var Title = '목록';
    var Description = '리뷰입니다';
    var list = template.Enroll_list(Reviews);
    var html = template.HTML(Title, list,
      `<h2>${Title}</h2>${Description}`,
      `<a href="/create">create</a>`,
      authCheck.statusUI(request, response)
    );
    response.send(html);
  })
)
  app.get('/enroll/sub', (req, res) => {
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
})
//수강신청
app.get('/enroll/sub_result', (req, res) => {
		console.log('test1_length',req.query.Course_type.length);
		console.log('test2_length',req.query.Course_day.length);
		console.log('test3_length',req.query.Course_time.length);
		console.log('typeof1',req.query.Course_type[0]);
		console.log('typeof?',typeof(Number(req.query.Course_type[0])));
		var dataList=[];
		for(let a=0; a<req.query.Course_type.length; a++){
			for(let b=0; b<req.query.Course_day.length; b++){
				for(let c=0; c<req.query.Course_time.length; c++){
					console.log('a,b,c_number',a, b, c);
					console.log('a,b,c',Number(req.query.Course_type[a]), Number(req.query.Course_day[b]),Number(req.query.Course_time[c]))
					db.query(`select * from Instructor left join (select * from Instructor_Time_date where Course_Active = 0) AS Temp  on Instructor.Teacher_ID = Temp.Teacher_ID left join Instructor_DATE AS ID on ID.Date_ID = Temp.Date_ID left join Instructor_TIME AS IT on IT.TIME_ID = Temp.TIME_ID  left join Course AS C on Temp.Course_ID = C.Course_ID 
					Where Temp.Course_ID = ? and Temp.TIME_ID = ? and Temp.Date_ID = ?;`,[Number(req.query.Course_type[a]), Number(req.query.Course_day[b]),Number(req.query.Course_time[c])],
					function(error2, Instructor){
						if(error2) throw error2;
						if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
							res.redirect('/auth/login');
							return false;
						}else {
							for(var data of Instructor) dataList.push(data);
						}
						console.log("dataList111",dataList);
						console.log('req_test',req.query.Course_type, req.query.Course_day, req.query.Course_time);
						}	
					)
				}
			}
		}
		setTimeout(function(){
		console.log('result of DataList', dataList);
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
})
app.get('/payment/complete',(req,res) => {
   db.query('update Student set Point = Point - ? where Email_Address = ?',[,req.session.email],function(error, result){
    if(error) throw error;
    res.redirect('/');
   });
})
app.get('/enroll/:CourseId/:DateId/:TIMEId', (req,res) => {
  var Student = req.session.email;
  console.log('student',Student)
  var Course_Id = req.params.CourseId;
  db.query(`select C.Subject, price from Course AS C left join Course_price AS CP on C.subject = CP.subject where C.Course_ID = ?; 
  select * from Student where Email_Address = ?; `,[Course_Id, Student],
  (error, result) => {
    if(error) throw error;
    console.log('result',result)
  var html = template.HTML('수강신청페이지입니다.',
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
        
        const input = document.querySelector('#point_use');
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
          var discount_price = document.getElementById('point_use').value;
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
      }, function (rsp) {
        console.log('rsp',rsp);
        if(rsp.status == 'paid' && rsp.paid_amount == 100){
          if (rsp.success) {
              var msg = '결제가 완료되었습니다.';
              msg += '고유ID : ' + rsp.imp_uid;
              msg += '상점 거래ID : ' + rsp.merchant_uid;
              msg += '결제 금액 : ' + rsp.paid_amount;
              msg += '카드 승인번호 : ' + rsp.apply_num;
              alert(msg);
              window.location.href = 'http://localhost:3000/payment/complete';
          } else {
              var msg = '결제에 실패하였습니다.';
              msg += '에러내용 : ' + rsp.error_msg;
              alert(msg);
          }     
        }else{
          alert("위조")
        }
      });
    }
        </script>

			`,'','',
			authCheck.statusUI(req, res)
		);
		res.send(html);	
      })
})
app.get('/page/:pageId', (request,response) =>
db.query(`SELECT * FROM Review`, function(error,Reviews){
    if(error){
      throw error;
    }
    db.query(`SELECT * FROM Review LEFT JOIN Student ON Review.Student_ID=Student.Student_ID WHERE Review.Review_ID=?`,[request.params.pageId], function(error2, Review){
      if(error2){
        throw error2;
      }
      console.log(Review);
     var Title = Review[0].Title;
     var Description = Review[0].Description;
     var list = template.list(Reviews);
     var html = template.HTML(Title, list,
       `
       <h2>${Title}</h2>
       ${Description}
       <p>by ${Review[0].Login_ID}</p>
       `,
       ` <a href="/create">create</a>
           <a href="/update/${request.params.pageId}">update</a>
           <form action="/delete_process" method="post">
             <input type="hidden" name="id" value="${request.params.pageId}">
             <input type="submit" value="delete">
              </form>`
           ,
           authCheck.statusUI(request, response)
     );
     response.send(html);
    })
 })
)

app.get('/create', (request,response) =>
db.query(`SELECT * FROM Review`, function(error,Reviews){
    db.query('SELECT * FROM Student', function(error2, authors){
      var nickname = request.session.nickname;
      var Title = 'Create';
      var list = template.list(Reviews);
      var html = template.HTML(Title, list,
        `
        <form action="/create_process" method="post">
          <p><input type="text" name="Title" placeholder="Title"></p>
          <p>
            <textarea name="Description" placeholder="Description"></textarea>
          </p>
          <p>
            ${template.authorSelect(authors)}
            ${nickname}
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a>`,
        authCheck.statusUI(request, response)
      );
      response.writeHead(200);
      response.end(html);
    });
  })
  )

  app.post('/create_process',function(request,response){
          var post = request.body;
          console.log(post);
          db.query(`
            INSERT INTO Review (Title, Description, Create_at, Student_ID, Order_subject) 
              VALUES(?, ?, NOW(), ?, ?)`,
            [post.Title, post.Description, post.author, post.author], 
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/create`});
              response.end();
            }
          )
      })


    app.get('/update/:pageId',function(request,response){
        db.query('SELECT * FROM Review', function(error, Reviews){
            if(error){
              throw error;
            }
            db.query(`SELECT * FROM Review WHERE Review_ID=?`,[request.params.pageId], function(error2, Review){
              if(error2){
                throw error2;
              }
              db.query('SELECT * FROM Student', function(error2, authors){
                var nickname = request.session.nickname;
                var list = template.list(Reviews);
                var html = template.HTML(Review[0].Title, list,
                  `
                  <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${Review[0].Review_ID}">
                    <p><input type="text" name="Title" placeholder="Title" value="${Review[0].Title}"></p>
                    <p>
                      <textarea name="Description" placeholder="Description">${Review[0].Description}</textarea>
                    </p>
                    <p>
                      ${template.authorSelect(authors, Review[0].Student_ID, nickname)}
                      ${request.session.nickname}
                    </p>
                    <p>
                      <input type="submit">
                    </p>
                  </form>
                  `,
                  `<a href="/create">create</a> <a href="/update?id=${Review[0].id}">update</a>`,
                  authCheck.statusUI(request, response)
                );
                response.send(html);
              });
            });
        });
    })


    app.post('/update_process', function(request,response){
          var post = request.body;
          console.log(post);
          db.query('UPDATE Review SET Title=?, Description=?, Student_ID=? WHERE Review_ID=?', [post.Title, post.Description, post.author_id, post.id], function(error, result){
            response.writeHead(302, {Location: `/page/${post.id}`});
            response.end();
          })
      });



    app.post('/delete_process', function(request, response){
          var post = request.body;
          db.query('DELETE FROM Review WHERE Review_ID = ?', [post.id], function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/review`});
            response.end();
          });
      });


      app.get('/myinfo', (request,response) =>
      db.query(`SELECT * FROM Student`, function(error,Reviews){
            var nickname = request.session.nickname;
            
            db.query('SELECT * FROM Student WHERE Login_ID = ? ',[nickname], function(error2, authors){
            var Title = '내정보';
            var html = template.HTML(Title, '',
              `
                <p>이름 ${authors[0].Name}</p>
                <p>비밀번호 ${authors[0].Password}</p>
                <p>전화번호 ${authors[0].Phone_Number}</p>
                <p>주소 ${authors[0].Address}</p>
                <p>이메일 ${authors[0].Email_Address}</p>
                <p>적립금 ${authors[0].Point}</p>
              `,
              `<a href="/myinfo/update">수정</a>
               <a href="/myinfo/class">내강의실</a>
              `,
              authCheck.statusUI(request, response)
            );
            response.writeHead(200);
            response.end(html);
          });
        })
        )

        app.get('/myinfo/update', (request,response) =>
      db.query(`SELECT * FROM Student`, function(error,Reviews){
          if(error){
          throw error;
          }
            var nickname = request.session.nickname;
            
            db.query('SELECT * FROM Student WHERE Login_ID = ? ',[nickname], function(error2, authors){
                if(error2){
                throw error2;
              }
            //console.log(authors);
            var Title = '내정보';
            
            var html = template.HTML(Title, '',
              `
              <form action="/update_mypage" method="post">
              <input type="hidden" name="id" value="${authors[0].Student_ID}">
              <p>이름<input type="text" name="Name" placeholder="Name" value="${authors[0].Name}"></p>
              <p>전화번호<input type="text" name="Phone_Number" placeholder="Phone_Number" value="${authors[0].Phone_Number}"></p>
              <p>비밀번호<input type="text" name="Password" placeholder="Password" value="${authors[0].Password}"></p>
              <p>주소<input type="text" name="Address" placeholder="Address" value="${authors[0].Address}"></p>
              <p>이메일<input type="text" name="Email_Address" placeholder="Email_Address" value="${authors[0].Email_Address}"></p>
              <p>
                <input type="submit">
              </p>
              </form>
              `,
              ``,
              authCheck.statusUI(request, response)
            );
            response.writeHead(200);
            response.end(html);
          });
        })
        )

        app.post('/update_mypage', function(request,response){
          var post = request.body;
          console.log(post);
          db.query('UPDATE Student SET Name=?, Phone_Number=? , Password=? ,Address=?, Email_Address=?  WHERE Student_ID=?', [post.Name, post.Phone_Number, post.Password, post.Address, post.Email_Address, post.id], function(error, result){
            if(error){
              throw error;
              }  
            response.writeHead(302, {Location: `/myinfo`});
            response.end();
          })
      });


// 서버 만들고
const httpServer = http.createServer(app);
// 소켓 서버랑 합치기
const wsServer = SocketIO(httpServer);

//소켓 연결시
wsServer.on("connection", (socket) => {
  // join Room
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });

  // offer
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });

  // answer
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });

  //ice
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

httpServer.listen(3000, handleListen);

 