module.exports = {
    HTML: function (title, body, authStatusUI) {
      return `
      <!doctype html>
      <html>
      <head>    
        <title>Login TEST - ${title}</title>
        <meta charset="utf-8">
        <style>
          @import url(http://fonts.googleapis.com/earlyaccess/notosanskr.css);
  
          body {
              font-family: 'Noto Sans KR', sans-serif;
              background-color: white;
              margin-top: 100px;
  
          }
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&family=Roboto:wght@300&display=swap');
*{
    margin: 0;
    padding: 0;
    box-sizing: inherit;
}



footer{
  background-color: white;
  text-align: center;
  text-transform: uppercase;
  padding-top: 30px;
  margin-top: auto;
}

footer li{
  list-style: none;
  margin: 10px;
  display: inline-block;
}

.icons a{
  background: #FFFBAC;
  color: #272727;
  padding: 14px;
  font-size: 20px;
  border-radius: 100%;
  display: flex;
}
.icons a:hover{
  color: black;
  transition: 0.5s;
}

.menu a{
  color: black;
  text-transform: capitalize;
}
.menu a:hover{
  color: #52527a;
  transition: 0.5s;
}

.footer-copyright{
  background-color:#303030;
  color: #ffffff;
  padding: 15px;
  margin-top: 30px;
  text-transform: capitalize;
}

.footer-copyright p{
  margin-bottom: 0px;
}
          
          .father{

            width:271px;
            height:391px;
            background-color:#ccc;
            text-align:center;
            line-height:2.7;
            margin:auto;
            margin-top:101px;
            position:relative;
            border-radius:21px;
            transition:all 1s ease-in-out;
            transform-style:preserve-3d;
             
        
        }
        
        .lotaion{
            line-height:9.1;
            color:white;
        }
        
        
        .father>div{
        
            position:absolute;
            top:0;
            left:0;
            width:100%;
            height:100%;
            border-radius:21px;
        
        
        }
        
        .father .child1{
            z-index:2;
            background-color:rgb(19, 18, 18);
            transition:all 1s ease-in-out;
            -webkit-backface-visibility: hidden;
            -moz-backface-visibility: hidden;
            backface-visibility: hidden;
        }
        
        .father:hover{
            transform: rotateY(180deg);
        }
        
        .father .child2{
            z-index:1;
            background-color:rgb(240, 58, 58);
            transition:all 1s ease-in-out;
            transform: rotateY(180deg);
            -webkit-backface-visibility: hidden;
            -moz-backface-visibility: hidden;
            backface-visibility: hidden;
        }
          #logo {
            background-image: url('http://localhost:3000/image/logo.jpg');
            background-size: cover;
            width: 70%;
            height:110px; 
            width:450px;
            flex-shrink: 1;
            margin-bottom: 50px;
            z-index: 2;
            position: relative;
          }
          a {
            text-decoration: none;
          }
          
          .number-circle-list {
            list-style: none;
            padding-left: 1rem;
            counter-reset: circle-counter;
          }
          
          .number-circle-list--list-item {
            counter-increment: circle-counter;
            margin-bottom: 0.25rem;
          }
          .number-circle-list--list-item:before {
            content: counter(circle-counter);
            background-color: #e1e1e1;
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            display: inline-block;
            font-size: 0.75rem;
            line-height: 1.5rem;
            color: black;
            text-align: center;
            margin-right: 0.5rem;
            position: relative;
            top: -2px;
          }
          .number-circle-list--list-item:last-child {
            margin-bottom: 0;
          }
          .number-circle-list--list-item .number-circle-list--list-item {
            margin-left: 0.25rem;
          }
          
          .number-circle-list--primary-color .number-circle-list--list-item:before {
            background-color: #0d5cab;
            color: white;
          }
          
          .number-circle-list--secondary-color .number-circle-list--list-item:before {
            background-color: #72c267;
            color: white;
          }
          
          .number-circle-list--tertiary-color .number-circle-list--list-item:before {
            background-color: #168dde;
            color: white;
          }
          
          html {
            font-size: 16px;
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
            margin-bottom: 30px;
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
          .nav-left{
            padding: 15px;
            cursor: pointer;
          }
          
          .nav-left a{
            text-align: right;
            text-decoration: none;
            color: black;
          }
          .background {
              background-color: white;
              height: auto;
              width: 100%;
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
          .button-arounder > a {
            color: white;
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
            border-radius: 20px;
            width: 70%;
            height:720px; 
            width:1080px;
            flex-shrink: 1;
            margin-bottom: 50px;
            z-index: 2;
            position: relative;
          }
          #bg3 {
            background-image: url('http://localhost:3000/image/3.jpg');
            background-size: 100% 120%;
            background-repeat: no-repeat;
            height:480px; 
            width:780px;
            flex-shrink: 1;
            margin-bottom: 50px;
            z-index: 2;
            position: relative;
          }
          #bg4 {
            background-image: url('http://localhost:3000/image/4.jpg');
            background-size: 100% 120%;
            background-repeat: no-repeat;
            height:480px; 
            width:780px;
            flex-shrink: 1;
            margin-bottom: 50px;
            z-index: 2;
            position: relative;
          }
          #bg5 {
            background-image: url('http://localhost:3000/image/5.jpg');
            background-size: 100% 120%;
            background-repeat: no-repeat;
            height:780px; 
            width:380px;
            flex-shrink: 1;
            margin-bottom: 50px;
            z-index: 2;
            position: relative;
          }
          #bg6 {
            background-image: url('http://localhost:3000/image/6.jpg');
            background-size: 100% 120%;
            background-repeat: no-repeat;
            height:720px; 
            width:1080px;
            flex-shrink: 1;
            margin-bottom: 50px;
            z-index: 2;
            position: relative;
          }
          #title {
            margin: 50px;
            font-weight: 700;
          }
          #mg{
            margin: 120px;
          }
          .col{
            display : flex;
          }
          .col_title{
            margin : 10px 30px 10px 30px;
          }
          .btn {
            background: hsl(var(--hue), 98%, 80%);
            border: none;
            border-radius: 7px;
            cursor: pointer;
            color: black;
            font: 600 1.05rem/1 "Nunito", sans-serif;
            letter-spacing: 0.05em;
            overflow: hidden;
            padding: 1.15em 3.5em;
            min-height: 3.3em;
            position: relative;
            text-transform: lowercase;
          }
          .btn--yellow {
            --hue: 46;
          }
          .btn--green {
            --hue: 163;
          }
          .btn--purple {
            --hue: 244;
          }
          .btn--red {
            --hue: 0;
          }
          .btn--blue {
            --hue: 210;
          }
          .btn:active, .btn:focus {
            outline: 3px solid hsl(calc(var(--hue) + 90), 98%, 80%);
          }
          .btn + .btn {
            margin-top: 2.5em;
          }
          .btn__txt {
            position: relative;
            z-index: 2;
          }
          .btn__bg {
            background: hsl(var(--hueBg), 98%, 80%);
            border-radius: 50%;
            display: block;
            height: 0;
            left: 50%;
            margin: -50% 0 0 -50%;
            padding-top: 100%;
            position: absolute;
            top: 50%;
            width: 100%;
            transform: scale(0);
            transform-origin: 50% 50%;
            transition: transform 0.175s cubic-bezier(0.5, 1, 0.89, 1);
            z-index: 1;
          }
          .btn__bg:nth-of-type(1) {
            --hueBg: calc(var(--hue) - 90);
            transition-delay: 0.1725s;
          }
          .btn__bg:nth-of-type(2) {
            --hueBg: calc(var(--hue) - 180);
            transition-delay: 0.115s;
          }
          .btn__bg:nth-of-type(3) {
            --hueBg: calc(var(--hue) - 270);
            transition-delay: 0.0575s;
          }
          .btn__bg:nth-of-type(4) {
            --hueBg: calc(var(--hue) - 360);
            transition-delay: 0s;
          }
          .btn:hover .btn__bg, .btn:focus .btn__bg, .btn:active .btn__bg {
            transform: scale(1.5);
            transition: transform 0.35s cubic-bezier(0.11, 0, 0.5, 0);
          }
          .btn:hover .btn__bg:nth-of-type(1), .btn:focus .btn__bg:nth-of-type(1), .btn:active .btn__bg:nth-of-type(1) {
            transition-delay: 0.115s;
          }
          .btn:hover .btn__bg:nth-of-type(2), .btn:focus .btn__bg:nth-of-type(2), .btn:active .btn__bg:nth-of-type(2) {
            transition-delay: 0.23s;
          }
          .btn:hover .btn__bg:nth-of-type(3), .btn:focus .btn__bg:nth-of-type(3), .btn:active .btn__bg:nth-of-type(3) {
            transition-delay: 0.345s;
          }
          .card {
            background: #fff;
            border-radius: 2px;
            display: inline-block;
            height: 300px;
            margin: 1rem;
            position: relative;
            width: 300px;
          }
          
        
          
          .card-3 {
            box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
          }
          .ask{
            display: inline-block;
          }
          .ask_title{
            color: #333;
            border-bottom: 4px solid #7FFF65;
            padding-bottom: 5px;
            position: relative;
          }
          
          .ask_title:before{
          /*     content: '';
              position: absolute;
              bottom: -20px;
              left: 50%;
              width: 20px;
              height: 20px;
              background: white;
              border-left: 4px solid #7FFF65;
             */
            content: ' ';
            position: absolute;
            width: 0;
            height: 0;
            left: 30px;
            bottom: -30px;
            border: 15px solid;
            border-color: #7FFF65 transparent transparent #7FFF65;
          }
          
          .ask_title:after{
          /*     content: '';
              position: absolute;
              bottom: -20px;
              left: 49%;
              width: 15px;
              height: 31px;
              transform: rotate(51deg);
              border-right: 4px solid #7FFF65; */
              
            content: ' ';
            position: absolute;
            width: 0;
            height: 0;
            left: 34px;
            bottom: -20px;
            border: 15px solid;
            border-color: #fff transparent transparent #fff;
          }
          blockquote {
            margin: 0px 0px 1.75em 0px;
            position: relative;
            padding: 20px 55px;
          background: #f9f9f9;
        }
        
        blockquote:after {
            font-size: 76px;
            position: absolute;
            top: -15px;
          left: 10px;
            color: #0d689c;
        }
        
        .entry-content blockquote p {
            max-width: 100%;
          padding: 0;
          margin: 0 0 15px;
          font-size: 20px;
        }
        
          
          
      </style>
      
      <nav>
      <img src='http://localhost:3000/image/1.png'
      alt="카카오 라이언" width="100" height="100" align="left" border="0">
      <div align="right">
            ${authStatusUI}
        </div>
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
          ${body}
      </body>
      <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
      <!--Google Fonts-->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&display=swap" rel="stylesheet">
      <footer>
      <ul class="icons">
          <li><a href="#"><ion-icon name="logo-whatsapp"></ion-icon></a></li>
          <li><a href="#"><ion-icon name="mail-outline"></ion-icon></a></li>
          <li><a href="#"><ion-icon name="logo-instagram"></ion-icon></a></li>
      </ul>
      <ul class="menu">
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact Us</a></li>
      </ul>
          <div class="footer-copyright">
              <p>Copyright @ 2022 All Rights Reserved.</p>
          </div>
  </footer>
      </html>
      `;
    }
  }