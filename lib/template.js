var sanitizeHtml = require('sanitize-html');
module.exports = {
  HTML:function(title, list, body, control, authStatusUI){
    return `
    <!doctype html>
    <html>
    <meta charset="UTF-8">
    <script src="http://code.jquery.com/jquery-latest.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
          @import url(http://fonts.googleapis.com/earlyaccess/notosanskr.css);
  
          body {
              font-family: 'Noto Sans KR', sans-serif;
              background-color: white;
              margin: 0;
              padding: 0;
              width:100vw;
              height: 100vh;
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
          ul.mylist li:before,
          ul.mylist li, ol.mylist li {
            padding: 5px 0px 5px 5px;
            margin-bottom: 5px;
            border-bottom: 1px solid #efefef;
            font-size: 18px;
        }
        .content {
          display: flex;
          justify-content: center;
          align-items: center;
          width:100%;
          height:100%;
        }
        .loader-wrapper {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          background-color: #242f3f;
          display:flex;
          justify-content: center;
          align-items: center;
        }
        .loader {
          display: inline-block;
          width: 30px;
          height: 30px;
          position: relative;
          border: 4px solid #Fff;
          animation: loader 2s infinite ease;
        }
        .loader-inner {
          vertical-align: top;
          display: inline-block;
          width: 100%;
          background-color: #fff;
          animation: loader-inner 2s infinite ease-in;
        }
        
        @keyframes loader {
          0% { transform: rotate(0deg);}
          25% { transform: rotate(180deg);}
          50% { transform: rotate(180deg);}
          75% { transform: rotate(360deg);}
          100% { transform: rotate(360deg);}
        }
        
        @keyframes loader-inner {
          0% { height: 0%;}
          25% { height: 0%;}
          50% { height: 100%;}
          75% { height: 100%;}
          100% { height: 0%;}
        }
      </style>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
    <nav>
    <img src='http://localhost:3000/image/1.png'
    alt="logo" width="125" height="125" align="left" border="0">
      <div class="background">
        <ul class="nav-container">
          <li class="nav-item"><a href="/">코딩나라란</a><li>
          <li class="nav-item"><a href="/curriculum">커리큘럼</a><li>
          <li class="nav-item"><a href="/enroll/sub">수강신청</a><li>
          <li class="nav-item"><a href="/review">강좌후기</a><li>
          <li class="nav-item"><a href="/ask">고객센터</a><li>
          <li class="nav-item"><a href="/ask">${authStatusUI}</a><li> 
        </ul>
      </div>
    </nav>
    <div class="loader-wrapper">
      <span class="loader"><span class="loader-inner"></span></span>
    </div>

    <script>
        $(window).on("load",function(){
          $(".loader-wrapper").fadeOut(1000);
        });
    </script>
    <div align="center">
      <h1><p></p></h1>
    </div>
      ${body}
      ${control}
      ${list}
    </body>
    
    </html>
    `;
  },
  list:function(topics){
    var list = '<ol class="mylist">';
    var i = 0;
    console.log(topics)
    while(i < topics.length){
      list = list + `<li><a href="/review/page/${topics[i].Review_ID}">${topics[i].Title}<div align="center">${topics[i].Description}</div><div align="right">${topics[i].Create_at}</div></a></li>`;
      i = i + 1;
    }
    list = list+'</ol>';
    return list;
  },authorSelect:function(authors, author_id, nickname){
    var tag = '';
    var i = 0;
    while(i < authors.length){
      var selected = '';
      if(authors[i].Student_ID === author_id) {
        selected = ' selected';
      }
      if(authors[i].Login_ID === nickname){
      tag += `<option value="${authors[i].Student_ID}"${sanitizeHtml(selected)}>${authors[i].Login_ID}</option>`;
      }
      i++;
    }
    return `
      <select name="author_id">
        ${tag}
      </select>
    `
  },Enroll_list : function(topics){
    var list = '<ol class="mylist">';
    var i = 0;
    console.log('topics', topics);
    while(i < topics.length){
      list = list + `
      <li>
        <a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}"> 
            <div>
            <p>Name :  ${sanitizeHtml(topics[i].Name)} </p>
            </div>
            <div align="center"> Course_ID : ${sanitizeHtml(topics[i].Subject)}</div>
            <div align="right"><p>Time_ID : ${sanitizeHtml(topics[i].Available_Start_Time)} Date_ID : ${sanitizeHtml(topics[i].Available_DATE)} </p></div>
          </a>
       </li>
       `;
      i = i + 1;
    }
    list = list+'</ol>';
    return list;
  }
  ,create_auth:function(authors, author_id, nickname){
      var i = author_id;
      if(authors[i-1].Login_ID === nickname ) {
        return``
      }
    return `
    <script type="text/javascript">alert("권한이 없습니다.");
    document.location.href="/review";
    </script>
    `
  },authorSelect_create:function(authors, nickname){
    var tag = '';
    var i = 0;
    while(i < authors.length){
      var selected = '';
      if(authors[i].Login_ID === nickname) {
        selected = ' selected';
      }
      if(authors[i].Login_ID === nickname){
      tag += `<option value="${authors[i].Student_ID}"${selected}>${authors[i].Login_ID}</option>`;
      }
      i++;
    }
    return `
      <select  name="author_id">
        ${tag}
      </select>
    `
  }

}