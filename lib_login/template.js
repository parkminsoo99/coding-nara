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