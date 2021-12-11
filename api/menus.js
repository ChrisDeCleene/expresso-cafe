const express = require("express");
const menusRouter = express.Router();

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

menusRouter.param("menuId", (req, res, next, menuId) => {
  const sql = "SELECT * FROM Menu WHERE id = $menuId";
  const values = { $menuId: menuId };
  db.get(sql, values, (err, menu) => {
    if (err) {
      next(err);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

const menuItemsRouter = require("./menuItems");
menusRouter.use("/:menuId/menu-items", menuItemsRouter);

menusRouter.get("/", (req, res, next) => {
  db.all("SELECT * FROM Menu", (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.json({ menus: menus });
    }
  });
});

menusRouter.post("/", (req, res, next) => {
  const { title } = req.body.menu;
  if (!title) {
    res.sendStatus(400);
  }
  const sql = "INSERT INTO Menu (title) VALUES ($title)";
  const values = { $title: title };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      const sql = "SELECT * FROM Menu WHERE id = $id";
      const values = { $id: this.lastID };
      db.get(sql, values, (err, menu) => {
        if (err) {
          next(err);
        } else {
          res.status(201).json({ menu: menu });
        }
      });
    }
  });
});

menusRouter.get("/:menuId", (req, res, next) => {
  res.json({ menu: req.menu });
});

menusRouter.put("/:menuId", (req, res, next) => {
  const { title } = req.body.menu;
  const id = req.params.menuId;
  if (!title) {
    res.sendStatus(400);
  } else {
    const sql = "UPDATE Menu SET title = $title WHERE id = $id";
    const values = { $title: title, $id: id };
    db.run(sql, values, function (error) {
      if (error) {
        next(error);
      } else {
        const sql = "SELECT * FROM Menu WHERE id = $id";
        const values = { $id: id };
        db.get(sql, values, (err, menu) => {
          if (err) {
            next(err);
          } else {
            res.json({ menu: menu });
          }
        });
      }
    });
  }
});

menusRouter.delete("/:menuId", (req, res, next) => {
  const menuId = req.params.menuId;
  const sql = "SELECT * FROM MenuItem WHERE menu_id = $menuId";
  const values = { $menuId: menuId };
  db.all(sql, values, (err, menuItems) => {
    if (err) {
      next(err);
    } else if (menuItems.length === 0) {
      const sql = "DELETE FROM Menu WHERE id = $menuId";
      const values = { $menuId: menuId };
      db.run(sql, values, function (error) {
        if (error) {
          next(error);
        } else {
          res.status(204).json({ menu: req.menu });
        }
      });
    } else {
      console.log('Menu items exist on this menu id. Could not complete your action.')
      res.sendStatus(400);
    }
  });
});

module.exports = menusRouter;
