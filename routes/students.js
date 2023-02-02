const express = require('express');
const router = express.Router();
const db = require('../db/database').getDatabase();
const tables = require('../db/tables');
const { validateStudent } = require('../db/models');

router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.student}`;
    db.all(sqlQuery, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        // res.send(rows);
        res.render("../FrontEnd/students.ejs", { students: rows });
    });
});

router.get("/create", function (req, res) {
    res.render("../FrontEnd/createStudent.ejs");
});


router.get("/:id", (req, res) => {
    const id = req.params.id;
    const sqlQuery = `SELECT * FROM ${tables.tableNames.student} WHERE ${tables.studentColumns.id} = ?`;
    db.get(sqlQuery, [req.params.id], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "A student with the requested ID was not found."
            });
        }
        // return res.send(rows);
        res.render("../FrontEnd/studentById.ejs", { student: rows });
    });
});


router.get("/:id/advisor", (req, res) => {
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.instructor}
    WHERE ${tables.instructorColumns.id} =
        (SELECT ${tables.studentColumns.instructor_id}
        FROM ${tables.tableNames.student}
        WHERE ${tables.studentColumns.id} = ?
        )`;

    db.get(sqlQuery, [req.params.id], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!row) {
            return res.status(404).send({
                message: "Advisor for this student not found."
            });
        }
        // res.send(row);
        res.render("../FrontEnd/studentAdvisor.ejs", { instructor: row });
    });
});


router.post("/", (req, res) => {
    const { error } = validateStudent(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const iname = req.body.name;
    const icreds = req.body.total_credits;
    const idept = req.body.department_name;
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.student}
    (name, total_credits, department_name)
    VALUES ('${iname}', ${icreds}, '${idept}')`;

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the student details"
            });
        }
        res.redirect("/students");
    });
});


router.delete("/:id", (req, res) => {
    const sqlQuery = `
    DELETE FROM ${tables.tableNames.student}
    WHERE ${tables.studentColumns.id} == ?`

    db.run(sqlQuery, [req.params.id], (err) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred while trying to delete this student."
            });
        }
        return res.send({
            message: "Student deleted successfully."
        });
    });
});

router.post("/:id/delete", (req, res) => {
    const sqlQuery = `
    DELETE FROM ${tables.tableNames.student}
    WHERE ${tables.studentColumns.id} == ?`

    db.run(sqlQuery, [req.params.id], (err) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred while trying to delete this student."
            });
        }
        return res.redirect("/students");
    });
});

module.exports = router;
