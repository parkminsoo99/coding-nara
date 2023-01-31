var express = require('express');
var router = express.Router();
var authCheck = require('../lib_login/authCheck.js');
var sanitizeHtml = require('sanitize-html');
var Tokens = require("csrf");
var tokens = new Tokens();
var fs = require('fs');

router.get('/', (req, res) => {
    req.session.secret = tokens.secretSync();
    var token = tokens.create(req.session.secret);
    if (!tokens.verify(req.session.secret, token)) {
      throw new Error('invalid token!')
    }else{
        res.render('main_page',
        {
          authCheck : authCheck.statusUI(req, res)
        });
    }
})

  module.exports = router;