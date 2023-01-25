module.exports = {
  HTML:function(title, list, body, control, authStatusUI){
    return `
    <!doctype html>
    <html>
    <meta charset="UTF-8">
    <!-- jQuery -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-1.12.4.min.js" ></script>
    <!-- iamport.payment.js -->
    <script type="text/javascript" src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js"></script>
    <style>
          @import url(http://fonts.googleapis.com/earlyaccess/notosanskr.css);
          
  
          body {
              font-family: 'Noto Sans KR', sans-serif;
              background-color: white;
              margin: 50px;
  
          }
          table {
            border-collapse: collapse;
            border-spacing: 0;
          }
          section.notice {
            padding: 80px 0;
          }
          
          .page-title {
            margin-bottom: 60px;
          }
          .page-title h3 {
            font-size: 28px;
            color: #333333;
            font-weight: 400;
            text-align: center;
          }
          
          #board-search .search-window {
            padding: 15px 0;
            background-color: #f9f7f9;
          }
          #board-search .search-window .search-wrap {
            position: relative;
          /*   padding-right: 124px; */
            margin: 0 auto;
            width: 80%;
            max-width: 564px;
          }
          #board-search .search-window .search-wrap input {
            height: 40px;
            width: 100%;
            font-size: 14px;
            padding: 7px 14px;
            border: 1px solid #ccc;
          }
          #board-search .search-window .search-wrap input:focus {
            border-color: #333;
            outline: 0;
            border-width: 1px;
          }
          #board-search .search-window .search-wrap .btn {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 108px;
            padding: 0;
            font-size: 16px;
          }
          
          .board-table {
            font-size: 13px;
            width: 100%;
            border-top: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
          }
          
          .board-table a {
            color: #333;
            display: inline-block;
            line-height: 1.4;
            word-break: break-all;
            vertical-align: middle;
          }
          .board-table a:hover {
            text-decoration: underline;
          }
          .board-table th {
            text-align: center;
          }
          
          .board-table .th-num {
            width: 100px;
            text-align: center;
          }
          
          .board-table .th-date {
            width: 200px;
          }
          
          .board-table th, .board-table td {
            padding: 14px 0;
          }
          
          .board-table tbody td {
            border-top: 1px solid #e7e7e7;
            text-align: center;
          }
          
          .board-table tbody th {
            padding-left: 28px;
            padding-right: 14px;
            border-top: 1px solid #e7e7e7;
            text-align: left;
          }
          
          .board-table tbody th p{
            display: none;
          }
          
          .btn {
            display: inline-block;
            padding: 0 30px;
            font-size: 15px;
            font-weight: 400;
            background: transparent;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            -ms-touch-action: manipulation;
            touch-action: manipulation;
            cursor: pointer;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            border: 1px solid transparent;
            text-transform: uppercase;
            -webkit-border-radius: 0;
            -moz-border-radius: 0;
            border-radius: 0;
            -webkit-transition: all 0.3s;
            -moz-transition: all 0.3s;
            -ms-transition: all 0.3s;
            -o-transition: all 0.3s;
            transition: all 0.3s;
          }
          
          .btn-dark {
            background: #555;
            color: #fff;
          }
          
          .btn-dark:hover, .btn-dark:focus {
            background: #373737;
            border-color: #373737;
            color: #fff;
          }
          
          .btn-dark {
            background: #555;
            color: #fff;
          }
          
          .btn-dark:hover, .btn-dark:focus {
            background: #373737;
            border-color: #373737;
            color: #fff;
          }
          
          /* reset */
          
          * {
            list-style: none;
            text-decoration: none;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
          }
          .clearfix:after {
            content: '';
            display: block;
            clear: both;
          }
          .container {
            width: 1100px;
            margin: 0 auto;
          }
          .blind {
            position: absolute;
            overflow: hidden;
            clip: rect(0 0 0 0);
            margin: -1px;
            width: 1px;
            height: 1px;
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
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
    <div align="center">
      <h1><p></p></h1>
    </div>
      ${body}
      ${control}
      ${list}
    </body>
    </html>
    `;
  },list:function(topics){
    var list = '';
    var i = 0;
    while(i < topics.length){
      list = list + `<tr>
                    <td><a href="/review/page/${topics[i].Review_ID}">${i+1}</a></td>
                    <th>
                    <a href="/review/page/${topics[i].Review_ID}">
                    ${topics[i].Title}
                    </a>
                    </th>
                    <td>${topics[i].Create_at}</a></td>
                    </tr>`;
      i = i + 1;
    }
    list = list+'';
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
      tag += `<option value="${authors[i].Student_ID}"${selected}>${authors[i].Login_ID}</option>`;
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
    while(i < topics.length){
      list = list + `
      <li>
        <a href="/enroll/${topics[i].Course_ID}/${topics[i].Date_ID}/${topics[i].TIME_ID}"> 
            <div>
            <p>Name :  ${topics[i].Name} </p>
            </div>
            <div align="center"> ${topics[i].Phone_Number}</div>
            <div align="right"><p>Time_ID : ${topics[i].Available_Start_Time} Date_ID : ${topics[i].Available_DATE} Course_ID : ${topics[i].Subject}</p></div>
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