module.exports = {
    HTML: function (title, body, authStatusUI) {
      return `
      <!doctype html>
      <html>
      <head>
        <title>Login TEST - ${title}</title>
        <meta charset="utf-8">
        <script type="text/javascript" src="https://code.jquery.com/jquery-1.12.4.min.js" ></script>
        <!-- iamport.payment.js -->
        <script type="text/javascript" src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js"></script>
        <style>
          body {
              font-family: 'Noto Sans KR', sans-serif;
              background-color: white;
              margin: 50px;
          }
          .tree,
.tree ul {
  font-size: 30px;
  margin:0 0 0 1em; /* indentation */
  padding:0;
  list-style:none;
  color:#369;
  position:relative;
}

.tree ul {margin-left:.5em} /* (indentation/2) */

.tree:before,
.tree ul:before {
  content:"";
  display:block;
  width:0;
  position:absolute;
  top:0;
  bottom:0;
  left:0;
  border-left:1px solid;
}

.tree li {
  margin:0;
  padding:0 1.5em; 
  line-height:2em; 
  font-weight:bold;
  position:relative;
}

.tree li:before {
  content:"";
  display:block;
  width:10px; /* same with indentation */
  height:0;
  border-top:1px solid;
  margin-top:-1px; /* border top width */
  position:absolute;
  top:1em; /* (line-height/2) */
  left:0;
}

.tree li:last-child:before {
  background:white; /* same with body background */
  height:auto;
  top:1em; /* (line-height/2) */
  bottom:0;
}
          
          
          .container{
            width: 90%;
            height: 100%;
            overflow: hidden;
          }
          .container img{
            max-width: 100%;
            height: auto;
            display: block;

          }
          .product-list{
            width: 675px;
            margin-left: auto;
            margin-right: auto;
          }
          .product{
            width: 225px;
            text-align: center;
            display: block;
            color: #545454;
            text=decoration: none;
            float: left;
          }
          .product-name{
            margin-top: 20px;
            margin-bottom: 4px;
          }
          
          header{
            margin-top: 80px;
          }
          img{
            position: absolute;
            left: 0px;
            top: 0px
          }
          .nav-container{
            display: flex;
            position: fixed;
            top : 0;
            flex-direction: row;
            width: 100%;
            margin: 0;
            padding: 0;
            background-color: white;
            list-style-type: none;
          }
          .nav-item{
            padding: 15px;
            cursor: pointer;
          }
          .nav-item a{
            text-align: center;
            text-decoration: none;
            color: black;
          }
          .nav-right{
            padding: 15px;
            cursor: pointer;
          }
          .nav-right a{
            text-align: right;
            text-decoration: none;
            color: black;
          }
          .background {
              background-color: white;
              height: auto;
              width: 90%;
              max-width: 450px;
              padding: 10px;
              margin: 0 auto;
              border-radius: 5px;
              box-shadow: 0px 40px 30px -20px rgba(0, 0, 0, 0.3);
              text-align: center;
          }
  
          form {
              display: flex;
              padding: 30px;
              flex-direction: column;
          }
  
          .login {
              border: none;
              border-bottom: 2px solid #D1D1D4;
              background: none;
              padding: 10px;
              font-weight: 700;
              transition: .2s;
              width: 75%;
          }
          .login:active,
          .login:focus,
          .login:hover {
              outline: none;
              border-bottom-color: #6A679E;
          }
  
          .btn {            
              border: none;
              width: 75%;
              background-color: #6A679E;
              color: white;
              padding: 15px 0;
              font-weight: 600;
              border-radius: 5px;
              cursor: pointer;
              transition: .2s;
          }
          .btn:hover {
              background-color: #595787;
          }
<<<<<<< HEAD
          .buttons-container {
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          button {
            background: white;
            border: solid 2px black;
            padding: .375em 1.125em;
            font-size: 1rem;
          }
          
          .button-arounder {
            font-size: 2rem;
            background: hsl(190deg, 30%, 15%);
            color: hsl(190deg, 10%, 95%);
            
            box-shadow: 0 0px 0px hsla(190deg, 15%, 5%, .2);
            transfrom: translateY(0);
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
            border-bottom-left-radius: 0px;
            border-bottom-right-radius: 0px;
            
            --dur: .15s;
            --delay: .15s;
            --radius: 16px;
            
            transition:
              border-top-left-radius var(--dur) var(--delay) ease-out,
              border-top-right-radius var(--dur) calc(var(--delay) * 2) ease-out,
              border-bottom-right-radius var(--dur) calc(var(--delay) * 3) ease-out,
              border-bottom-left-radius var(--dur) calc(var(--delay) * 4) ease-out,
              box-shadow calc(var(--dur) * 4) ease-out,
              transform calc(var(--dur) * 4) ease-out,
              background calc(var(--dur) * 4) steps(4, jump-end);
          }
          
          .button-arounder:hover,
          .button-arounder:focus {
            box-shadow: 0 4px 8px hsla(190deg, 15%, 5%, .2);
            transform: translateY(-4px);
            background: hsl(230deg, 50%, 45%);
            border-top-left-radius: var(--radius);
            border-top-right-radius: var(--radius);
            border-bottom-left-radius: var(--radius);
            border-bottom-right-radius: var(--radius);
          }
          #borderDemo {
            border: 5px dashed #000000;
            
            border-radius:50px 40px 40px 40px;
            flex-shrink : 1;
            }
          #bg2 {
            background-image: url('http://localhost:3000/image/2.jpg');
            background-size: cover;
            width: 70%;
            height:720px; 
            width:1080px;
            flex-shrink: 1;
            margin-bottom: 50px;
          }
          #bg3 {
            background-image: url('http://localhost:3000/image/3.jpg');
            background-size: 100% 120%;
            background-repeat: no-repeat;
            height:780px; 
            width:1080px;
            flex-shrink: 1;
            margin-bottom: 50px;
          }
          #bg4 {
            background-image: url('http://localhost:3000/image/4.jpg');
            background-size: 100% 120%;
            background-repeat: no-repeat;
            height:720px; 
            width:1080px;
            flex-shrink: 1;
            margin-bottom: 50px;
          }
          #bg5 {
            background-image: url('http://localhost:3000/image/5.jpg');
            background-size: 100% 120%;
            background-repeat: no-repeat;
            height:720px; 
            width:1080px;
            flex-shrink: 1;
            margin-bottom: 50px;
          }
          #bg6 {
            background-image: url('http://localhost:3000/image/6.jpg');
            background-size: 100% 120%;
            background-repeat: no-repeat;
            height:720px; 
            width:1080px;
            flex-shrink: 1;
            margin-bottom: 50px;
          }
          #title {
            margin: 50px;
            font-weight: 700;
          }
          #mg{
            margin: 120px;
          }
          .

          
=======
          .topNavIn {position:relative; width:1080px; margin:0 auto;}
>>>>>>> 0f35e68d (수강신청에 필요한 UI제작 및 디비에서 강사 정보+강의 시간등의 필요한 정보를 가져옴)
      </style>
      <nav>
      <img src='http://localhost:3000/image/1.png'
      alt="카카오 라이언" width="125" height="125" align="left" border="0">
        <div class="background">
          <ul class="nav-container">
            <li class="nav-item"><a href="/">코딩나라란</a><li>
            <li class="nav-item"><a href="/curriculum">커리큘럼</a><li>
            <li class="nav-item"><a href="/enroll/sub">수강신청</a><li>
            <li class="nav-item"><a href="/review">강좌후기</a><li>
            <li class="nav-item"><a href="/ask">고객센터</a><li> 
          </ul>
        </div>
      </nav>
      </head>
      <body>
          ${authStatusUI}
          ${body}
         
        </div>
      </body>
      </html>
      `;
    },ASK : function(title, body, authStatusUI){
        return `
        <!doctype html>
        <html>
        <head>
          <title>Login TEST - ${title}</title>
          <meta charset="utf-8">
          <style>
            body {
                font-family: 'Noto Sans KR', sans-serif;
                background-color: white;
                margin: 50px;
            }
            header{
              margin-top: 80px;
            }
            img{
              position: absolute;
              left: 0px;
              top: 0px
            }
            .nav-container{
              display: flex;
              position: fixed;
              top : 0;
              flex-direction: row;
              width: 100%;
              margin: 0;
              padding: 0;
              background-color: white;
              list-style-type: none;
            }
            .nav-item{
              padding: 15px;
              cursor: pointer;
            }
            .nav-item a{
              text-align: center;
              text-decoration: none;
              color: black;
            }
            .nav-right{
              padding: 15px;
              cursor: pointer;
            }
            .nav-right a{
              text-align: right;
              text-decoration: none;
              color: black;
            }
            .background {
                background-color: white;
                height: auto;
                width: 90%;
                max-width: 450px;
                padding: 10px;
                margin: 0 auto;
                border-radius: 5px;
                box-shadow: 0px 40px 30px -20px rgba(0, 0, 0, 0.3);
                text-align: center;
            }
    
            form {
                display: flex;
                padding: 30px;
                flex-direction: column;
            }
    
            .login {
                border: none;
                border-bottom: 2px solid #D1D1D4;
                background: none;
                padding: 10px;
                font-weight: 700;
                transition: .2s;
                width: 75%;
            }
            .login:active,
            .login:focus,
            .login:hover {
                outline: none;
                border-bottom-color: #6A679E;
            }
    
            .btn {            
                border: none;
                width: 75%;
                background-color: #6A679E;
                color: white;
                padding: 15px 0;
                font-weight: 600;
                border-radius: 5px;
                cursor: pointer;
                transition: .2s;
            }
            .btn:hover {
                background-color: #595787;
            }
            .topNavIn {position:relative; width:1080px; margin:0 auto;}
            .aside_class{
              width: 200px;
              height: 890px;
            }
            .menu_item{
              width: 200px;
              height: 56px;
            }
            .question{
              width:100%;
              height:890px;
            }
            .question_li_a::before{
              content : "Q  "
            }
        </style>
        <nav>
        <img src="http://t1.daumcdn.net/friends/prod/editor/dc8b3d02-a15a-4afa-a88b-989cf2a50476.jpg"
        alt="카카오 라이언" width="200" height="100" align="left" border="0">
          <div class="background">
            <ul class="nav-container">
              <li class="nav-item"><a href="/">코딩나라란</a><li>
              <li class="nav-item"><a href="/curriculum">커리큘럼</a><li>
              <li class="nav-item"><a href="/enroll/sub">수강신청</a><li>
              <li class="nav-item"><a href="/review">강좌후기</a><li>
              <li class="nav-item"><a href="/ask">고객센터</a><li>
            </ul>
        </nav>
        </head>
        <body>
            ${authStatusUI}
            ${body}
           
          </div>
        </body>
        </html>
        `;
    }
  }