var express = require('express');
var router = express.Router();
var authCheck = require('../lib_login/authCheck.js');
var db = require('../db');
var sanitizeHtml = require('sanitize-html');
var Tokens = require("csrf");
var tokens = new Tokens();


router.get('/', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    db.query(`SELECT * FROM Student`, function(error,Reviews){
      var email = request.session.email;
      console.log(email);
      db.query('SELECT * FROM Student WHERE Email_Address = ? ',[email], function(error2, authors){
        response.render('my_page_root',
        {
          authCheck : authCheck.statusUI(request, response),
          Name : authors[0].Name,
          Password : authors[0].Password,
          Phone_Number : authors[0].Phone_Number,
          Address : authors[0].Address,
          Email_Address : authors[0].Email_Address,
          Point : authors[0].Point
        });
      }) 
    })
  }
})
router.get('/update', function (request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
  db.query(`SELECT * FROM Student`, function(error,Reviews){
  if(error){
  throw error;
  }
    var email = request.session.email;
    db.query('SELECT * FROM Student WHERE Email_Address = ? ',[email], function(error2, authors){
      if(error2){
      throw error2;
    }
    console.log(authors)
    response.render('my_page_update',
    {
      authCheck : authCheck.statusUI(request, response),
      Name : authors[0].Name,
      Password : authors[0].Password,
      Phone_Number : authors[0].Phone_Number,
      Address : authors[0].Address,
      Email_Address : authors[0].Email_Address,
    });
    });
  })}
})

router.post('/update_mypage', function(request,response){
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error('invalid token!')
  }else{
    var post = request.body;
    console.log(post);
    db.query('UPDATE Student SET Name=?, Phone_Number=? , Password=? ,Address=?, Email_Address=?  WHERE Student_ID=?', [post.Name, post.Phone_Number, post.Password, post.Address, post.Email_Address, post.id], function(error, result){
      if(error){
        throw error;
      }  
      response.writeHead(302, {Location: `/myinfo`});
      response.end();
    })
  }
});

router.get("/class", (req, res) => {
    res.render("home");
});


module.exports = router;
