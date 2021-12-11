const express = require("express");
const menuItemsRouter = express.Router({ mergeParams: true });

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

menuItemsRouter.param("menuItemId", (req, res, next, menuItemId) => {
  const sql = "SELECT * FROM MenuItem WHERE id = $menuItemId";
  const values = { $menuItemId: menuItemId };
  db.get(sql, values, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.get("/", (req, res, next) => {
  const menuId = req.params.menuId;
  const sql = "SELECT * FROM MenuItem WHERE menu_id = $menuId";
  const values = { $menuId: menuId };
  db.all(sql, values, (err, menuItems) => {
    if (err) {
      next(err);
    } else {
      res.json({ menuItems: menuItems });
    }
  });
});

menuItemsRouter.post("/", (req, res, next) => {
  const menuId = req.params.menuId;
  const { name, description, inventory, price } = req.body.menuItem;
  if (!name || !description || !inventory || !price) {
    res.sendStatus(400);
  }
  const sql =
    "INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)";
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId,
  };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      const sql = "SELECT * FROM MenuItem WHERE id = $id";
      const values = { $id: this.lastID };
      db.get(sql, values, (err, menuItem) => {
        if (err) {
          next(err);
        } else {
          res.status(201).json({ menuItem: menuItem });
        }
      });
    }
  });
});

menuItemsRouter.put("/:menuItemId", (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  const menuId = req.params.menuId;
  const { name, description, inventory, price } = req.body.menuItem;
  if (!name || !description || !inventory || !price ) {
    res.sendStatus(400);
  }
  const sql =
    "UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $id";
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId,
    $id: menuItemId
  };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      const sql = "SELECT * FROM MenuItem WHERE id = $id";
      const values = { $id: menuItemId };
      db.get(sql, values, (err, menuItem) => {
        if (err) {
          next(err);
        } else {
          res.json({ menuItem: menuItem });
        }
      });
    }
  });
});

menuItemsRouter.delete("/:menuItemId", (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  const sql = "DELETE FROM MenuItem WHERE id = $menuItemId";
  const values = { $menuItemId: menuItemId };
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      res.status(204).json({ $menuItem: req.menuItem });
    }
  });
});

module.exports = menuItemsRouter;
