var express = require("express");
var router = express.Router();
var authCheck = require("../lib_login/authCheck.js");
var template = require("./template");
var db = require("../db");
var sanitizeHtml = require("sanitize-html");
var Tokens = require("csrf");
var tokens = new Tokens();
let start = Date.now();
const date_now = new Date(start);

router.get("/", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(
      `SELECT * FROM Review LEFT JOIN Student ON Review.Student_ID = Student.Student_ID LEFT JOIN Course ON Review.Order_subject = Course.Course_ID ORDER BY Create_at DESC  limit 0, 10;
              select count(*) as c from Review;
    `,
      function (error, Reviews) {
        var title = "강좌후기";
        var list = template.list(Reviews[0]);
        var page_list = template.page_list(Reviews[1]);
        response.render("review_page_root", {
          authCheck: authCheck.statusUI(request, response),
          List: list,
          Page_List: page_list,
          Title: title,
        });
      }
    );
  }
});

router.get("/page/:pageId", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Review`, function (error, Reviews) {
      if (error) {
        throw error;
      }
      db.query(
        `SELECT * FROM Review LEFT JOIN Student ON Review.Student_ID=Student.Student_ID WHERE Review.Review_ID=?`,
        [request.params.pageId],
        function (error2, Review) {
          if (error2) {
            throw error2;
          }
          var title = Review[0].Title;
          var description = Review[0].Description;
          var login_ID = Review[0].Login_ID;
          var list = template.list(Reviews);
          var pageID = request.params.pageId;
          response.render("review_page_enter", {
            authCheck: authCheck.statusUI(request, response),
            List: list,
            Title: title,
            Description: description,
            Login_ID: login_ID,
            Page_ID: pageID,
          });
        }
      );
    });
  }
});

router.get("/create", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    if (!authCheck.isOwner(request, response)) {
      // 로그인 안되어있으면 로그인 페이지로 이동시킴
      response.redirect("/auth/login");
      return false;
    } else {
      response.render("review_page_create", {
        authCheck: authCheck.statusUI(request, response),
      });
    }
  }
});

router.post("/create_process", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    if (!authCheck.isOwner(request, response)) {
      // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect("/auth/login");
      return false;
    } else {
      db.query(
        `SELECT * FROM Review LEFT JOIN Student ON Review.Student_ID = Student.Student_ID LEFT JOIN Course ON Review.Order_subject = Course.Course_ID LEFT JOIN Section ON Student.Student_ID = Section.Student_ID WHERE Student.Student_ID = ?; 
              `,
        [request.session.Student_Id],
        function (error, Reviews) {
          if (error) {
            throw error;
          }
          if (Reviews[0].Review_Count === 1) {
            //포인트추가
            let point;

            point = Number(Reviews[0].Point);

            db.query(
              `UPDATE Student SET Point = ? WHERE Student_ID = ?;
               UPDATE Section SET Review_Count = ? WHERE Student_ID = ?;
              `,
              [
                point + 2000,
                request.session.Student_Id,
                0,
                request.session.Student_Id,
              ],
              function (error, Reviews) {
                if (error) {
                  throw error;
                }
              }
            );
          }
        }
      );
      var sanitize_title = sanitizeHtml(request.body.Title);
      var sanitize_description = sanitizeHtml(request.body.Description);
      var sanitize_Email_Address = sanitizeHtml(request.session.email);
      if (sanitize_title != "" && sanitize_description != "") {
        db.query(
          `SELECT * FROM Review LEFT JOIN Student ON Review.Student_ID = Student.Student_ID LEFT JOIN Course ON Review.Order_subject = Course.Course_ID LEFT JOIN Section ON Student.Student_ID = Section.Student_ID WHERE Student.Student_ID = ?; 
                `,
          [request.session.Student_Id],
          function (error, Reviews) {
            if (error) {
              throw error;
            }
         
        db.query(
          `
          INSERT INTO Review (Student_ID, Title, Description, Create_at, Name, Order_subject, Recommand_Count) 
            VALUES(?, ?, ?, ?, ?, ?, 0)`,
          [
            request.session.Student_Id,
            sanitize_title,
            sanitize_description,
            date_now,
            sanitize_Email_Address,
            Reviews[0].Course_ID,
          ],
          function (error, result) {
            if (error) {
              throw error;
            }
            db.query(
              `SELECT * FROM Review LEFT JOIN Student ON Review.Student_ID = Student.Student_ID LEFT JOIN Course ON Review.Order_subject = Course.Course_ID`,
              function (error, Reviews) {
                if (error) {
                  throw error;
                }
                var title = "강좌후기";
                var list = template.list(Reviews);
                response.writeHead(302, { Location: `/review` });
                response.end();
              }
            );
          }
        );
      }
      )
      } else {
        response.send(
          `<script type="text/javascript">alert("잘못된 정보를 입력했습니다."); 
        document.location.href="/review/create";</script>`
        );
      }
    }
  }
});

router.get("/update/:pageId", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    if (!authCheck.isOwner(request, response)) {
      // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect("/auth/login");
      return false;
    } else {
      db.query("SELECT * FROM Review", function (error, Reviews) {
        if (error) {
          throw error;
        }
        db.query(
          `SELECT * FROM Review WHERE Review_ID=?`,
          [request.params.pageId],
          function (error2, Review) {
            if (error2) {
              throw error2;
            }
            db.query("SELECT * FROM Student", function (error2, authors) {
              var nickname = request.session.nickname;
              var list = template.list(Reviews);
              var title = Review[0].Title;
              var description = Review[0].Description;
              var login_ID = Review[0].Login_ID;
              var list = template.list(Reviews);
              var review_ID = Review[0].id;
              response.render("review_page_update", {
                authCheck: authCheck.statusUI(request, response),
                List: list,
                Title: title,
                Description: description,
                Login_ID: login_ID,
                Nickname: nickname,
                Review_ID: review_ID,
              });
            });
          }
        );
      });
    }
  }
});

router.post("/update_process", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    if (!authCheck.isOwner(req, res)) {
      // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect("/auth/login");
      return false;
    } else {
      var post = request.body;
      var sanitize_title = sanitizeHtml(post.Title);
      var sanitize_description = sanitizeHtml(post.Description);
      if (sanitize_title != "" && sanitize_description != "") {
        db.query(
          "UPDATE Review SET Title=?, Description=?, Student_ID=? WHERE Review_ID=?",
          [post.Title, post.Description, post.author_id, post.id],
          function (error, result) {
            response.redirect(`/review/page/${post.id}`);
          }
        );
      } else {
        response.redirect(`/review/page/${post.id}`);
      }
    }
  }
});

router.post("/delete_process", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    if (!authCheck.isOwner(request, response)) {
      // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect("/auth/login");
      return false;
    } else {
      var post = request.body;
      db.query(
        "DELETE FROM Review WHERE Review_ID = ?",
        [post.id],
        function (error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, { Location: `/review` });
          response.end();
        }
      );
    }
  }
});
router.post("/increase_recommand", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    if (!authCheck.isOwner(request, response)) {
      // 로그인 안되어있으면 로그인 페이지로 이동시킴
      res.redirect("/auth/login");
      return false;
    } else {
      db.query(
        `update review set Review_Count = ? where Review_ID =? `,
        [sanitizeHtml(request.body.New_num), sanitizeHtml(request.body.Order)],
        function (error1, results) {
          if (error1) throw error1;
        }
      );
    }
  }
});
router.get("/:pageId", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var number = Number(request.params.pageId) - 1;
    if (number > 0) number = number * 10;
    db.query(
      `select * from Review LEFT JOIN Student ON Review.Student_ID = Student.Student_ID LEFT JOIN Course ON Review.Order_subject = Course.Course_ID ORDER BY Create_at DESC limit ?,10;
              select count(*) as c from Review;
    `,
      [number],
      function (error1, result) {
        if (error1) throw error1;
        var list = template.list(result[0]);
        var page_list = template.page_list(result[1]);
        var title = "강좌후기";
        response.render("review_page_root", {
          authCheck: authCheck.statusUI(request, response),
          List: list,
          Page_List: page_list,
          Title: title,
        });
      }
    );
  }
});

module.exports = router;

