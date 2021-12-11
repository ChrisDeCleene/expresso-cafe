const express = require("express");
const employeesRouter = express.Router();

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

employeesRouter.param("employeeId", (req, res, next, employeeId) => {
  const sql = "SELECT * FROM Employee WHERE id = $employeeId";
  const values = { $employeeId: employeeId };
  db.get(sql, values, (err, employee) => {
    if (err) {
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

const timesheetsRouter = require("./timesheets");
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get("/", (req, res, next) => {
  db.all(
    "SELECT * FROM Employee WHERE is_current_employee = 1",
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.json({ employees: employees });
      }
    }
  );
});

employeesRouter.post("/", (req, res, next) => {
  const { name, position, wage } = req.body.employee;
  const isCurrentEmployee = 1;
  if (!name || !position || !wage) {
    res.sendStatus(400);
  } else {
    const sql =
      "INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)";
    const values = {
      $name: name,
      $position: position,
      $wage: wage,
      $isCurrentEmployee: isCurrentEmployee,
    };
    db.run(sql, values, function (error) {
      if (error) {
        next(error);
      } else {
        const sql = "SELECT * FROM Employee WHERE id = $id";
        const values = { $id: this.lastID };
        db.get(sql, values, (err, employee) => {
          if (err) {
            next(err);
          } else {
            res.status(201).json({ employee: employee });
          }
        });
      }
    });
  }
});

employeesRouter.get("/:employeeId", (req, res, next) => {
  res.json({ employee: req.employee });
});

employeesRouter.put("/:employeeId", (req, res, next) => {
  const employeeId = req.params.employeeId;
  const { name, position, wage } = req.body.employee;
  const isCurrentEmployee = 1;
  if (!name || !position || !wage) {
    res.sendStatus(400);
  } else {
    const sql =
      "UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $employeeId";
    const values = {
      $name: name,
      $position: position,
      $wage: wage,
      $isCurrentEmployee: isCurrentEmployee,
      $employeeId: employeeId,
    };
    db.run(sql, values, function (error) {
      if (error) {
        next(error);
      } else {
        const sql = "SELECT * FROM Employee WHERE id = $employeeId";
        const values = { $employeeId: employeeId };
        db.get(sql, values, (err, employee) => {
          if (err) {
            next(err);
          } else {
            res.json({ employee: employee });
          }
        });
      }
    });
  }
});

employeesRouter.delete("/:employeeId", (req, res, next) => {
  const employeeId = req.params.employeeId
  const sql = "UPDATE Employee SET is_current_employee = 0 WHERE id = $id";
  const values = { $id: employeeId };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      const sql = "SELECT * FROM Employee WHERE id = $employeeId";
      const values = { $employeeId: employeeId };
      db.get(sql, values, (err, employee) => {
        if (err) {
          next(err);
        } else {
          res.json({ employee: employee });
        }
      });
    }
  });
});

module.exports = employeesRouter;
