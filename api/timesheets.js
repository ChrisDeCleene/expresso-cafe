const express = require("express");
const timesheetsRouter = express.Router({ mergeParams: true });

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

timesheetsRouter.param("timesheetId", (req, res, next, timesheetId) => {
  const sql = "SELECT * FROM Timesheet WHERE id = $timesheetId";
  const values = { $timesheetId: timesheetId };
  db.get(sql, values, (err, timesheet) => {
    if (err) {
      next(err);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next()
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get("/", (req, res, next) => {
  const employeeId = req.params.employeeId;
  const sql = "SELECT * FROM Timesheet WHERE employee_id = $employeeId";
  const values = { $employeeId: employeeId };
  db.all(sql, values, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.json({ timesheets: timesheets });
    }
  });
});

timesheetsRouter.post("/", (req, res, next) => {
  const employeeId = req.params.employeeId;
  const { hours, rate, date } = req.body.timesheet;
  if (!hours || !rate || !date) {
    res.sendStatus(400);
  }
  const sql =
    "INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)";
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId,
  };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      const sql = "SELECT * FROM Timesheet WHERE id = $id";
      const values = { $id: this.lastID };
      db.get(sql, values, (err, timesheet) => {
        if (err) {
          next(err);
        } else {
          res.status(201).json({ timesheet: timesheet });
        }
      });
    }
  });
});

timesheetsRouter.put("/:timesheetId", (req, res, next) => {
  const timesheetId = req.params.timesheetId;
  const { hours, rate, date } = req.body.timesheet;
  if(!hours || !rate || !date) {
    res.sendStatus(400);
  }
  const sql = "UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $timesheetId";
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date, 
    $timesheetId: timesheetId
   };
  db.run(sql, values, function(error) {
    if(error) {
      next(error);
    } else {
      const sql = 'SELECT * FROM Timesheet WHERE id = $timesheetId';
      const values = { $timesheetId: timesheetId };
      db.get(sql, values, (err, timesheet) => {
        if(err) {
          next(err)
        } else {
          res.json({ timesheet: timesheet })
        }
      })
    }
  })
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const timesheetId = req.params.timesheetId;
  const sql = "DELETE FROM Timesheet WHERE id = $timesheetId";
  const values = { $timesheetId: timesheetId };
  db.run(sql, values, function(error) {
    if(error) {
      next(error);
    } else {
      res.status(204).json({ $timesheet: req.timesheetId });
    }
  });
})

module.exports = timesheetsRouter;
