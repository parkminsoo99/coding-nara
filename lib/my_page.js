var express = require('express');
var router = express.Router();
var template = require('./template');
var authCheck = require('../lib_login/authCheck.js');
var db = require('../db');


router.get('/', (request,response) =>
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

        router.get('/update', (request,response) =>
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
              <form action="/myinfo/update_mypage" method="post">
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

        router.post('/update_mypage', function(request,response){
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

      router.get("/myinfo/class", (req, res) => {
        res.render("home");
      });
      

      module.exports = router;