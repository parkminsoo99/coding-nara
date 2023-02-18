var express = require("express");
var router = express.Router();
var authCheck = require("../lib_login/authCheck.js");
var db = require("../db");
var sanitizeHtml = require("sanitize-html");
var Tokens = require("csrf");
var tokens = new Tokens();
var template = require("./template");

router.get("/", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Student`, function (error, Reviews) {
      var email = request.session.email;
      console.log(email);
      db.query(
        "SELECT * FROM Instructor WHERE Email_Address = ? ",
        [email],
        function (error2, Instructor) {
          if (error2) {
            throw error2;
          }
          console.log(Instructor);
          console.log(Instructor === undefined);
          if (Instructor !== undefined && Instructor.length > 0) {
            //선생일경우
            return response.redirect("/myinfo/instructor");
          } else {
            db.query(
              "SELECT * FROM Student WHERE Email_Address = ? ",
              [email],
              function (error2, result) {
                db.query(
                  `select * from Section as S left join Instructor_Time_Date as ITD on S.Course_ID = ITD.Course_ID and S.TIME_ID = ITD.TIME_ID and S.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = S.Teacher_ID left join Course as C on S.Course_ID = C.Course_ID left join Instructor_TIME as IT on S.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on S.DATE_ID = ID.DATE_ID where Student_ID = ?;`,
                  [result[0].Student_ID],
                  (error2, results) => {
                    if (error2) throw error2;
                    console.log("results", results);
                    var list = template.lecture_list(results);
                    response.render("my_page_root", {
                      Title: "강의 리스트",
                      authCheck: authCheck.statusUI(request, response),
                      List: list,
                      Name: result[0].Name,
                      Password: result[0].Password,
                      Phone_Number: result[0].Phone_Number,
                      Address: result[0].Address,
                      Email_Address: result[0].Email_Address,
                      Point: result[0].Point,
                    });
                  }
                );
              }
            );
          }
        }
      );
    });
  }
});
router.get("/lecture/history", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Student WHERE Student.Email_Address = ?;`,
      [email],
      function (error, Reviews) {
        console.log(Reviews);
        db.query(
          "SELECT * FROM lecture_History left join Instructor_TIME on lecture_History.TIME_ID = Instructor_TIME.TIME_ID left join Instructor_DATE on lecture_History.DATE_ID = Instructor_DATE.DATE_ID left join Course on lecture_History.Course_ID = Course.Course_ID left join Instructor on lecture_History.Teacher_ID = Instructor.Teacher_ID  WHERE lecture_History.Student_ID = ?;",
          [Reviews[0].Student_ID],
          function (error2, history) {
            console.log(history);
            if (error2) throw error2;
            var list = template.lecture_list_history(history);
                response.render("my_page_lecture_history", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  // Name: result[0].Name,
                  // Password: result[0].Password,
                  // Phone_Number: result[0].Phone_Number,
                  // Address: result[0].Address,
                  // Email_Address: result[0].Email_Address,
                  // Point: result[0].Point,
                });
          }
        );
      }
    );
  }
});



router.get("/instructor", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Instructor WHERE Instructor.Email_Address = ?;`,
      [email],
      function (error, Reviews) {
        console.log(Reviews);

        db.query(
          "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
          [email],
          function (error2, result) {
            // console.log(result);
            db.query(
              `select * from Section as S left join Instructor_Time_Date as ITD on S.Course_ID = ITD.Course_ID and S.TIME_ID = ITD.TIME_ID and S.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = S.Teacher_ID left join Course as C on S.Course_ID = C.Course_ID left join Instructor_TIME as IT on S.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on S.DATE_ID = ID.DATE_ID left join Student on Student.Student_ID = S.Student_ID WHERE ITD.Course_Active = 1 AND ITD.Teacher_ID = ?;`,
              [Reviews[0].Teacher_ID],
              (error2, results) => {
                if (error2) throw error2;
                console.log("results", results);
                var list = template.lecture_list_instructor(results);
                response.render("my_page_instructor", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  Name: result[0].Name,
                  Password: result[0].Password,
                  Phone_Number: result[0].Phone_Number,
                  Address: result[0].Address,
                  Email_Address: result[0].Email_Address,
                  Point: result[0].Point,
                });
              }
            );
          }
        );
      }
    );
  }
});

router.get("/instructor/lecture/history", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Instructor WHERE Instructor.Email_Address = ?;`,
      [email],
      function (error, Reviews) {
        console.log('Reviews',Reviews);
        db.query(
          "SELECT * FROM lecture_History left join Instructor_TIME on lecture_History.TIME_ID = Instructor_TIME.TIME_ID left join Instructor_DATE on lecture_History.DATE_ID = Instructor_DATE.DATE_ID left join Course on lecture_History.Course_ID = Course.Course_ID left join Instructor on lecture_History.Teacher_ID = Instructor.Teacher_ID left join Student on lecture_History.Student_ID = Student.Student_ID  WHERE lecture_History.Teacher_ID = ?;",
          [Reviews[0].Teacher_ID],
          function (error2, history) {
            console.log('history',history);
            if (error2) throw error2;
            var list = template.lecture_list_history(history);
                response.render("my_page_lecture_history_instructor", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  // Name: result[0].Name,
                  // Password: result[0].Password,
                  // Phone_Number: result[0].Phone_Number,
                  // Address: result[0].Address,
                  // Email_Address: result[0].Email_Address,
                  // Point: result[0].Point,
                });
          }
        );
      }
    );
  }
});

router.get(
  "/instructor/update/:course/:date/:time",
  function (request, response) {
    request.session.secret = tokens.secretSync();
    var token = tokens.create(request.session.secret);
    if (!tokens.verify(request.session.secret, token)) {
      throw new Error("invalid token!");
    } else {
      db.query(`SELECT * FROM Instructor`, function (error, Reviews) {
        var email = request.session.email;
        console.log(email);

        db.query(
          "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
          [email],
          function (error2, result) {
            // console.log(result);
            db.query(
              `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
              [email],
              (error2, results) => {
                if (error2) throw error2;
                console.log("results", results);
                var list = template.lecture_list_instructor_update(results);
                var course = request.params.course;
                var date = request.params.date;
                var time = request.params.time;
                response.render("my_page_instructor_update_enter", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  Name: result[0].Name,
                  Password: result[0].Password,
                  Phone_Number: result[0].Phone_Number,
                  Address: result[0].Address,
                  Email_Address: result[0].Email_Address,
                  Point: result[0].Point,
                  course: course,
                  date: date,
                  time: time,
                  Teacher_ID: result[0].Teacher_ID,
                });
              }
            );
          }
        );
      });
    }
  }
);

router.post("/instructor/update/delete", function (request, response) {
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
      console.log("post", post);
      var Student_Id = request.session.Student_Id;
      var Name = request.session.nickname;
      console.log(post.Teacher_ID);
      console.log(Student_Id);
      const id = Number(Student_Id);
      console.log(Student_Id.toString());
      console.log(post.course);
      console.log(post.date);
      console.log(post.time);

      db.query(
        "DELETE FROM Instructor_Time_Date WHERE Teacher_ID = ? AND Course_ID = ? AND TIME_ID = ? AND DATE_ID = ?",
        [post.Teacher_ID, post.course, post.time, post.date],
        function (error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, { Location: `/myinfo/instructor/update` });
          response.end();
        }
      );
    }
  }
});

router.get("/instructor/update", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Instructor WHERE Instructor.Email_Address = ?`,
      [email],
      function (error, Reviews) {
        console.log(email);

        db.query(
          "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
          [email],
          function (error2, result) {
            // console.log(result);
            db.query(
              `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
              [email],
              (error2, results) => {
                if (error2) throw error2;
                // console.log("results", results);
                var list = template.lecture_list_instructor_update(results);
                response.render("my_page_instructor_update", {
                  Title: "강의 리스트",
                  authCheck: authCheck.statusUI(request, response),
                  List: list,
                  Name: result[0].Name,
                  Password: result[0].Password,
                  Phone_Number: result[0].Phone_Number,
                  Address: result[0].Address,
                  Email_Address: result[0].Email_Address,
                  Point: result[0].Point,
                  Teacher_ID: result[0].Teacher_ID,
                });
              }
            );
          }
        );
      }
    );
  }
});

router.get("/instructor/update/create", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Instructor`, function (error, Reviews) {
      var email = request.session.email;
      // console.log(email);

      db.query(
        "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
        [email],
        function (error2, result) {
          // console.log(result);
          db.query(
            `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
            [email],
            (error2, results) => {
              if (error2) throw error2;
              // console.log("results", results);
              var list = template.lecture_list_instructor_update(results);
              response.render("my_page_instructor_update_create", {
                Title: "강의 리스트",
                authCheck: authCheck.statusUI(request, response),
                List: list,
                Name: result[0].Name,
                Teacher_ID: result[0].Teacher_ID,
                Password: result[0].Password,
                Phone_Number: result[0].Phone_Number,
                Address: result[0].Address,
                Email_Address: result[0].Email_Address,
                Point: result[0].Point,
                Nickname: email,
              });
            }
          );
        }
      );
    });
  }
});

router.post("/instructor/update/create_process", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var email = request.session.email;
    db.query(
      `SELECT * FROM Instructor WHERE Instructor.Email_Address = ?`,
      [email],
      function (error, Reviews) {
        console.log("Reviews", Reviews);
        console.log(Reviews[0].Teacher_ID);
        console.log(Reviews[0].Name);

        db.query(
          "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
          [email],
          function (error2, result) {
            // console.log(result);
            db.query(
              `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
              [email],
              (error2, results) => {
                if (error2) throw error2;
                var post = request.body;
                console.log(post);
                console.log(result[0].Name);
                var dataList = [];
                for (let a = 0; a < post.Course_type.length; a++) {
                  for (let b = 0; b < post.Course_day.length; b++) {
                    for (let c = 0; c < post.Course_time.length; c++) {
                      db.query(
                        `insert into Instructor_Time_Date (Teacher_ID, Name, Course_ID, DATE_ID, TIME_ID, Course_Active) values(?,?,?,?,?,?);`,
                        [
                          Reviews[0].Teacher_ID,
                          Reviews[0].Name,
                          Number(post.Course_type[a]),
                          Number(post.Course_day[b]),
                          Number(post.Course_time[c]),
                          0,
                        ],
                        function (error2, Instructor) {
                          if (error2) throw error2;
                        }
                      );
                    }
                  }
                }
                response.writeHead(302, {
                  Location: `/myinfo/instructor/update`,
                });
                response.end();

                // console.log("results", results);
                // var list = template.lecture_list_instructor_update(results);
                // response.render("my_page_instructor_update_create", {
                //   Title: "강의 리스트",
                //   authCheck: authCheck.statusUI(request, response),
                //   List: list,
                //   Name: result[0].Name,
                //   Teacher_ID: result[0].Teacher_ID,
                //   Password: result[0].Password,
                //   Phone_Number: result[0].Phone_Number,
                //   Address: result[0].Address,
                //   Email_Address: result[0].Email_Address,
                //   Point: result[0].Point,
                //   Nickname : email
                // });
              }
            );
          }
        );
      }
    );
  }
});

router.post("/instructor/increase", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Instructor`, function (error, Reviews) {
      var email = request.session.email;
      // console.log(email);

      db.query(
        "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
        [email],
        function (error2, result) {
          // console.log(result);
          db.query(
            `SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID JOIN Course ON Course.Course_ID = Instructor_Time_Date.Course_ID JOIN Instructor_DATE ON Instructor_DATE.DATE_ID = Instructor_Time_Date.DATE_ID JOIN Instructor_TIME ON Instructor_TIME.TIME_ID = Instructor_Time_Date.TIME_ID WHERE Instructor.Email_Address = ?;`,
            [email],
            (error2, results) => {
              if (error2) throw error2;
              var post = request.body;
              console.log(post);
              console.log(post.Max);
              console.log(post.Increase);
              if (post.Max > post.Increase) {
                db.query(
                  //강의완료 업데이트
                  `UPDATE Section SET Teacher_ID = ?, Course_ID = ?, DATE_ID = ?, TIME_ID = ? ,Increase_Count = ?, Decrease_Count = ?;
                  insert into lecture_History (Student_ID, Teacher_ID, Complete_time, Course_ID, DATE_ID, TIME_ID) values(?,?,NOW(),?,?,?);`,
                  [
                    post.Teacher_ID,
                    post.course,
                    post.date,
                    post.time,
                    Number(post.Increase) + 1,
                    Number(post.Decrease) - 1,
                    post.Student_ID,
                    Reviews[0].Teacher_ID,
                    post.course,
                    post.date,
                    post.time,
                  ],
                  function (error2, result) {
                  }
                );
              } else if (post.Max === post.Increase) {
                db.query(
                  //강의삭제
                  "DELETE FROM Section WHERE Teacher_ID = ? AND Course_ID = ? AND DATE_ID = ? AND TIME_ID = ?",
                  [post.Teacher_ID, post.course, post.date, post.time],
                  function (error2, result) {
                    if (error2) throw error2;
                    db.query(
                      //강의삭제
                      "UPDATE Instructor_Time_Date SET Course_Active = ?, Teacher_ID = ?, Course_ID = ?, DATE_ID = ?, TIME_ID = ?",
                      [0, post.Teacher_ID, post.course, post.date, post.time],
                      function (error2, result) {}
                    );
                  }
                );
              }

              response.writeHead(302, { Location: `/myinfo/instructor` });
              response.end();

              // console.log("results", results);
              // var list = template.lecture_list_instructor_update(results);
              // response.render("my_page_instructor_update_create", {
              //   Title: "강의 리스트",
              //   authCheck: authCheck.statusUI(request, response),
              //   List: list,
              //   Name: result[0].Name,
              //   Teacher_ID: result[0].Teacher_ID,
              //   Password: result[0].Password,
              //   Phone_Number: result[0].Phone_Number,
              //   Address: result[0].Address,
              //   Email_Address: result[0].Email_Address,
              //   Point: result[0].Point,
              //   Nickname : email
              // });
            }
          );
        }
      );
    });
  }
});

router.post("/instructor/update/delete_process", function (request, response) {
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

router.get("/update", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);

  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Student`, function (error, Reviews) {
      if (error) {
        throw error;
      }
      var email = request.session.email;
      db.query(
        "SELECT * FROM Student WHERE Email_Address = ? ",
        [email],
        function (error2, authors) {
          if (error2) {
            throw error2;
          }
          // console.log(authors)
          response.render("my_page_update", {
            authCheck: authCheck.statusUI(request, response),
            Name: authors[0].Name,
            Password: authors[0].Password,
            Phone_Number: authors[0].Phone_Number,
            Address: authors[0].Address,
            Email_Address: authors[0].Email_Address,
          });
        }
      );
    });
  }
});

router.get("/update", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  db.query(`SELECT * FROM Instructor`, function (error, Reviews) {
    if (error) {
      throw error;
    }
    var email = request.session.email;
    db.query(
      "SELECT * FROM Instructor WHERE Email_Address = ? ",
      [email],
      function (error2, Instructor) {
        if (error2) {
          throw error2;
        }
        console.log(Instructor);

        var dataList = [];
        if (Instructor !== undefined || Instructor[0].length > 0) {
          //선생일경우
          db.query(
            "SELECT * FROM Instructor LEFT JOIN Instructor_Time_Date ON Instructor.Teacher_ID = Instructor_Time_Date.Teacher_ID WHERE Instructor.Email_Address = ?;",
            [email],
            function (error2, Instructor) {
              if (error2) throw error2;
              if (!authCheck.isOwner(request, response)) {
                // 로그인 안되어있으면 로그인 페이지로 이동시킴
                res.redirect("/auth/login");
                return false;
              } else {
                for (var data of Instructor) dataList.push(data);
                console.log(Instructor);
                var Update_list = template.Update_list(results);
              }
            }
          );
        }
        setTimeout(function () {
          var Update_list = template.Update_list(dataList);
          res.render("my_page_update", {
            authCheck: authCheck.statusUI(req, res),
            Update_list: Update_list,
          });
        }, 200);
      }
    );
  });

  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    db.query(`SELECT * FROM Student`, function (error, Reviews) {
      if (error) {
        throw error;
      }
      var email = request.session.email;
      db.query(
        "SELECT * FROM Student WHERE Email_Address = ? ",
        [email],
        function (error2, authors) {
          if (error2) {
            throw error2;
          }
          // console.log(authors)
          response.render("my_page_update", {
            authCheck: authCheck.statusUI(request, response),
            Name: authors[0].Name,
            Password: authors[0].Password,
            Phone_Number: authors[0].Phone_Number,
            Address: authors[0].Address,
            Email_Address: authors[0].Email_Address,
          });
        }
      );
    });
  }
});

router.get("/user_information_change", (request, response) => {
  response.render("user_information_change");
});

router.post("/update_mypage", function (request, response) {
  request.session.secret = tokens.secretSync();
  var token = tokens.create(request.session.secret);
  if (!tokens.verify(request.session.secret, token)) {
    throw new Error("invalid token!");
  } else {
    var post = request.body;
    console.log(post);
    db.query(
      "UPDATE Student SET Name=?, Phone_Number=? , Password=? ,Address=?, Email_Address=?  WHERE Student_ID=?",
      [
        post.Name,
        post.Phone_Number,
        post.Password,
        post.Address,
        post.Email_Address,
        post.id,
      ],
      function (error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, { Location: `/myinfo` });
        response.end();
      }
    );
  }
});

router.get("/lecture_list", (request, response) => {
  console.log(request.session.email);
  db.query(
    `select * from Student where Email_Address = ?;`,
    [request.session.email],
    (error1, result) => {
      if (error1) throw error1;
      console.log("result", result);
      db.query(
        `select * from Section as S left join Instructor_Time_Date as ITD on S.Course_ID = ITD.Course_ID and S.TIME_ID = ITD.TIME_ID and S.DATE_ID = ITD.DATE_ID and ITD.Teacher_ID = S.Teacher_ID left join Course as C on S.Course_ID = C.Course_ID left join Instructor_TIME as IT on S.TIME_ID = IT.TIME_ID left join  Instructor_DATE as ID on S.DATE_ID = ID.DATE_ID where Student_ID = ?;`,
        [result[0].Student_ID],
        (error2, results) => {
          if (error2) throw error2;
          console.log("results", results);
          var list = template.lecture_list(results);
          response.render("lecture_list", {
            Title: "강의 리스트",
            authCheck: authCheck.statusUI(request, response),
            List: list,
          });
        }
      );
    }
  );
});

router.get("/class", (req, res) => {
  res.render("home");
});

module.exports = router;
