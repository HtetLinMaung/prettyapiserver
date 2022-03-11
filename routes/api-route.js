const express = require("express");
const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner");
const isAuth = require("../middlewares/is-auth");
const Api = require("../models/Api");

const router = express.Router();

router
  .route("/")
  .post(isAuth, async (req, res) => {
    try {
      const { name, description, visibility, json, tags, access_key } =
        req.body;
      const api = new Api({
        name,
        access_key,
        description,
        visibility,
        json,
        owner: req.tokenData.ownerid,
        tags,
      });

      await api.save();
      api.ref = name.toLowerCase().trim().replaceAll(" ", "_") + `_${api._id}`;
      await api.save();

      const owner = await Owner.findById(api.owner);
      owner.apis.push(api._id);
      await owner.save();

      res.status(201).json({
        message: "Api created successfully",
        code: 201,
        data: api,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message, code: 500 });
    }
  })
  .get(async (req, res) => {
    try {
      const authHeader = req.get("Authorization");
      let tokenData = null;
      if (authHeader && authHeader.split(" ")[1]) {
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
          decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
          return res.status(401).json({ code: 401, message: "Invalid Token" });
        }
        if (!decodedToken) {
          return res
            .status(401)
            .json({ code: 401, message: "Not authenticated!" });
        }
        tokenData = decodedToken;
      }
      console.log(tokenData);

      const page = req.query.page ? parseInt(req.query.page) : 1;
      const per_page = req.query.per_page;
      const search = req.query.search;

      const filter = {};
      if (tokenData) {
        filter["owner"] = tokenData.ownerid;
      } else {
        filter["visibility"] = "public";
      }

      if (search) {
        filter.$text = { $search: search };
      }

      const select = "name ref description visibility tags createdAt";

      let apis = [];
      if (!per_page) {
        apis = await Api.find(filter)
          .sort({
            createdAt: -1,
          })
          .select(select);
      } else {
        apis = await Api.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(per_page * (page - 1))
          .limit(per_page)
          .select(select);
      }

      res.json({
        code: 200,
        message: "Success",
        data: apis,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message, code: 500 });
    }
  });

router
  .route("/:ref")
  .get(async (req, res) => {
    try {
      const authHeader = req.get("Authorization");
      let tokenData = null;
      if (authHeader && authHeader.split(" ")[1]) {
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
          decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
          return res.status(401).json({ code: 401, message: "Invalid Token" });
        }
        if (!decodedToken) {
          return res
            .status(401)
            .json({ code: 401, message: "Not authenticated!" });
        }
        tokenData = decodedToken;
      }
      const access_key = req.query.access_key;
      const api = await Api.findOne({ ref: req.params.ref });
      if (!api) {
        return res.status(404).json({
          code: 404,
          message: "Api not found",
        });
      }

      if (
        tokenData &&
        tokenData.ownerid != api.owner &&
        api.access_key != access_key
      ) {
        return res.status(401).json({
          code: 401,
          message: "Invalid access key",
        });
      }

      if (api.visibility == "private") {
        if (!tokenData) {
          return res
            .status(401)
            .json({ code: 401, message: "Not authenticated!" });
        }
        if (tokenData.ownerid != api.owner) {
          return res.status(401).json({
            code: 401,
            message: "You are not authorized to access this api",
          });
        }
      }

      res.json({
        code: 200,
        message: "Success",
        data: api,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message, code: 500 });
    }
  })
  .put(isAuth, async (req, res) => {
    try {
      const api = await Api.findOne({
        ref: req.params.ref,
        owner: req.tokenData.ownerid,
      });
      if (!api) {
        return res.status(404).json({
          code: 404,
          message: "Api not found",
        });
      }

      api.name = req.body.name;
      api.description = req.body.description;
      api.visibility = req.body.visibility;
      api.json = req.body.json;
      api.tags = req.body.tags;
      api.access_key = req.body.access_key;
      await api.save();
      res.json({
        code: 200,
        message: "Success",
        data: api,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message, code: 500 });
    }
  })
  .delete(isAuth, async (req, res) => {
    try {
      const api = await Api.findOne({
        ref: req.params.ref,
        owner: req.tokenData.ownerid,
      });
      if (!api) {
        return res.status(404).json({
          code: 404,
          message: "Api not found",
        });
      }
      await api.remove();
      res.sendStatus(204);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message, code: 500 });
    }
  });

module.exports = router;
