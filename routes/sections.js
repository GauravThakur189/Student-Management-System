const router = require('express').Router();
const tables = require('../db/tables');
const db = require('../db/database').getDatabase();
const { validateSection } = require('../db/models');


router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.section}`;
    db.all(sqlQuery, (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            })
        }
        // res.send(rows);
        res.render("../FrontEnd/sections.ejs", { sections: rows });
    });
});

router.get("/create", function (req, res) {
    res.render("../FrontEnd/createSection.ejs")
});


router.get("/:id", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.section} WHERE ${tables.sectionColumns.id} = ?`;
    db.get(sqlQuery, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "A section with the requested ID could not be found."
            });
        }
        // res.send(rows);
        res.render("../FrontEnd/sectionById.ejs", { section: rows });
    });
});

router.get("/:id/instructors", (req, res) => {

    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.instructor} 
    WHERE ${tables.instructorColumns.id} IN
        (SELECT ${tables.teachesColumns.instructor_id} 
        FROM ${tables.tableNames.teaches} 
        WHERE ${tables.teachesColumns.section_id} = $sectionId
        );
    `
    db.all(sqlQuery, { $sectionId: req.params.id }, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: "An error occurred." });
        }

        if (!rows) {
            return res.status(404).send({
                message: "Instructors of the section with the given ID could not be found."
            });
        }

        // res.send(rows);
        res.render("../FrontEnd/sectionInstructors.ejs", { instructors: rows });
    })
});


router.post("/", (req, res) => {
    const { error } = validateSection(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const Id = req.body.id;
    const Sem = req.body.semester;
    const Yr = req.body.year;
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.section}
    (id, semester, year)
    VALUES (${Id}, ${Sem}, ${Yr})`;

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the section details"
            });
        }
        res.redirect("/sections")
    });
});


router.delete("/:id", (req, res) => {
    const sqlQuery = `
    DELETE FROM ${tables.tableNames.section}
    WHERE ${tables.sectionColumns.id} = ?`;

    db.run(sqlQuery, [req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred while trying to delete this section."
            });
        }
        res.send({
            message: "Section deleted successfully"
        });
    });
});


router.post("/:id/delete", (req, res) => {
    const sqlQuery = `
    DELETE FROM ${tables.tableNames.section}
    WHERE ${tables.sectionColumns.id} = ?`;

    db.run(sqlQuery, [req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred while trying to delete this section."
            });
        }
        res.redirect("/sections");
    });
});

module.exports = router;
