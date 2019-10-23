const express = require("express");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const oracledb = require('oracledb');


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public")); 
app.set("view engine", "ejs");
app.use(flash());

app.use(require("express-session")({
    secret: "This is the best website ever",
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

let sections = [], instructors = [], courses = [], departments = [], grades = [], years = [], accounts = [], totalSections = [] ;

let connection;
const connect = async (id, year, section) => {
    const mypw = 'Tanishka6113';
        try {
            connection = await oracledb.getConnection({
              user          : "sys",
              password      : mypw,
              connectString : process.env.PORT || "localhost/orcldb",
              privilege: oracledb.SYSDBA
            });
            if(id !== null){
                result = await connection.execute(`select * from student where sid = '${id}' `);
            } else if (year !== null && section !== null) {
                result = await connection.execute(`select * from student where year = ${year} and section = '${section}' order by sid`);
            } else if (id === null && year === null && section === null) {
              result = await connection.execute(`select * from student order by sid`);
            }else {
              result = null;
            }
            courses = await connection.execute(`select * from courses `);
            sections = await connection.execute(`select * from section`);
            instructors = await connection.execute(`select * from instructors`);
            departments =  await connection.execute(`select * from department`);
            grades =  await connection.execute(`select * from grades`);
            years =  await connection.execute(`select distinct year from student`);
            totalSections = await connection.execute(`select distinct secname from section`);
            accounts = await connection.execute(`select * from socialAccounts`);

            // console.log(result ); console.log( sections ); console.log( instructors ); console.log( courses ); console.log( departments ); console.log( grades ); console.log( years ); console.log( accounts ); console.log( totalSections );
          } catch (err) {
            console.error(err.message);
          } finally {
            if (connection) {
              try {
                await connection.close();   // Always close connections
              } catch (err) {
                console.error(err.message);
              }
            }
      }
    };

    let grade = [], student = [], course = [];
    const getStudentGrade = async (id) => {
    const mypw = 'Tanishka6113';
        try {
            connection = await oracledb.getConnection({
              user          : "sys",
              password      : mypw,
              connectString : process.env.PORT || "localhost/orcldb",
              privilege: oracledb.SYSDBA
            });
            student = await connection.execute(`select * from student where sid = '${id}'`);
            grade = await connection.execute(`select * from grades where sid = '${id}'`);
            course = await connection.execute(`select * from courses `);
          } catch (err) {
            console.error(err.message);
          } finally {
            if (connection) {
              try {
                await connection.close();   // Always close connections
              } catch (err) {
                console.error(err.message);
              }
            }
      }
    };

    let socialAccounts = [];
    const getStudentAccounts = async (id) => {
    const mypw = 'Tanishka6113';
        try {
            connection = await oracledb.getConnection({
              user          : "sys",
              password      : mypw,
              connectString : process.env.PORT || "localhost/orcldb",
              privilege: oracledb.SYSDBA
            });
            student = await connection.execute(`select * from student where sid = '${id}'`);
            socialAccounts = await connection.execute(`select * from socialaccounts where sid = '${id}'`);
          } catch (err) {
            console.error(err.message);
          } finally {
            if (connection) {
              try {
                await connection.close();   // Always close connections
              } catch (err) {
                console.error(err.message);
              }
            }
      }
    };
    
    let errorMsg = null;

    const authInstructor = async (loginD) => {
          try {
              connection = await oracledb.getConnection({
                user          : loginD.insid,
                password      : loginD.password,
                connectString : process.env.PORT || "localhost/orcldb"
              });
              for (var key in loginD) {
                if (loginD.hasOwnProperty(key)) {
                  if(!isNaN(key)){
                    await connection.execute(`insert into sys.grades values (${parseInt(loginD.sid)}, ${parseInt(key)}, ${parseInt(loginD[key])})`);
                  }
                }
              }
              await connection.execute("commit");
            } catch (err) {
              console.log(err);
              errorMsg = err.message;
            } finally {
              if (connection) {
                try {
                  await connection.close();   // Always close connections
                } catch (err) {
                  errorMsg = err.message;
                }
              }
        }
      };


    const authHod = async (hodid, pass, sid, sname, gender, year, section, dept) => {
          try {
              connection = await oracledb.getConnection({
                user          : hodid,
                password      : pass,
                connectString : process.env.PORT || "localhost/orcldb"
              });
              await connection.execute(`insert into sys.student values (${sid}, '${sname}', '${gender}', ${year}, ${section}, ${dept})`);
              await connection.execute("commit");
            } catch (err) {
              console.log(errorMsg);
              errorMsg = err.message;
            } finally {
              if (connection) {
                try {
                  await connection.close();   // Always close connections
                } catch (err) {
                  console.error(err.message);
                }
              }
        }
      };

      const authStu = async (stuid, pass, sid, sname, gender, year, section, dept) => {
        try {
            connection = await oracledb.getConnection({
              user          : hodid,
              password      : pass,
              connectString : process.env.PORT || "localhost/orcldb"
            });
            await connection.execute(`insert into sys.student values (${sid}, '${sname}', '${gender}', ${year}, ${section}, ${dept})`);
            await connection.execute("commit");
          } catch (err) {
            console.log(errorMsg);
            errorMsg = err.message;
          } finally {
            if (connection) {
              try {
                await connection.close();   // Always close connections
              } catch (err) {
                console.error(err.message);
              }
            }
      }
    };

app.get("/", async (req, res) => {
     await connect(null, null, null);
    res.render("home", {students: [], heads: [], sections, courses, instructors, departments, grades, years, accounts});
});

app.post("/", (req, res) => {
    const getStudentInfo = async () => {
        // let results = [[1,'Ravi'], [2, 'Mano']];
        if(req.body.id) {
              await connect(req.body.id, null, null);
              // console.log(result);
              if(result === null) {
                // console.log("error");
                req.flash("error", "Invalid Number");
                res.redirect("/");
              } else if(result.rows.length === 0) {
                // console.log("error");
                req.flash("error", "Student with such id doesn't exist");
                res.redirect("/");
              } else {
              res.render("home", {students: result.rows,heads: result.metaData, sections, courses, instructors, departments, grades, years, accounts});
              }
            } else {
            await connect(null, req.body.year, req.body.section);
            // console.log(result);
            res.render("home", {students: result.rows,heads: result.metaData, sections, courses, instructors, departments, grades, years, accounts});
        }
    };
    getStudentInfo();
});

app.get("/updateGrades", async (req, res) => {
  res.render("updateGrades", {student: [], grade: [], course: []});
});

app.get("/updateGrades/id", (req, res) => {
  res.redirect("/updateGrades");
});

app.post("/updateGrades/id", async (req, res) => {
  await getStudentGrade(req.body.id);
  res.render("updateGrades",{student, grade, course});
});

app.post("/updateGrades", async (req, res) => {
  // console.log(req.body);
  await authInstructor(req.body);
  if(errorMsg !== null){
    req.flash("error", errorMsg);
    errorMsg = null;
    res.redirect("/updateGrades");
  } else {
  req.flash("success", "Updated Grades");
  res.redirect("/updateGrades");
  }
});



app.get("/addStudent", async (req, res) => {
  await connect(null, null, null);
  res.render("addStudent",{students: result, departments, sections, courses});
});

app.post("/addStudent", async (req, res) => {
  await authHod(req.body.username, req.body.password, parseInt(req.body.sid), req.body.sname, req.body.gender, parseInt(req.body.year), parseInt(req.body.section), parseInt(req.body.department));
  // console.log(req.body);
  // console.log(errorMsg);
  if(errorMsg !== null){
    req.flash("error", errorMsg);
    errorMsg = null;
    res.redirect("/addStudent");
  } else {
  req.flash("success", "Student Added");
  res.redirect("/addStudent");
  }
  });


app.get("/updateStudent", async (req, res) => {
  res.render("updateStudent", {student: [], socialAccounts: []});
});

app.get("/updateStudent/id", (req, res) => {
  res.redirect("/updateStudent");
});

app.post("/updateStudent/id", async (req, res) => {
  await getStudentAccounts(req.body.id);
  res.render("updateStudent",{student, socialAccounts});
});

app.post("/updateStudent", (req, res) => {
  res.send("Not Yet Done");
});

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("Server Started Succesfully");
});