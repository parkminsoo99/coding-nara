var express = require('express');
var router = express.Router();
var authCheck = require('../lib_login/authCheck.js');

router.get('/', (req, res) => {
    res.render('curri_page',
        {
          authCheck : authCheck.statusUI(req, res)
        });
  })
  router.get('/detail', (req, res) => {
    res.render('curri_page_detail',
        {
          authCheck : authCheck.statusUI(req, res)
        });
  })
module.exports = router;  