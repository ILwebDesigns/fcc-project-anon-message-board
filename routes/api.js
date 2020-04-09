/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var assert = require("chai").assert;
var mongoose = require("mongoose");
var Schema = require("mongoose").Schema;
var time = new Date();

try {
  mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    dbName: "database"
  });
} catch (err) {
  assert.equal(err, null, `Error connection db`);
}

var repliesSchema = new Schema({
  text: String,
  created_on: { type: Date, default: time },
  delete_password: {},
  reported: { type: Boolean, default: false }
});

const Reply = mongoose.model("replies", repliesSchema);

var threadSchema = new Schema({
  board: String,
  text: {},
  replies: [{ type: Schema.Types.ObjectId, ref: "replies" }],
  replycount: { type: Number, default: 0 },
  created_on: { type: Date, default: time },
  bumped_on: { type: Date, default: time },
  delete_password: {},
  reported: { type: Boolean, default: false }
});

const Thread = mongoose.model("threads", threadSchema);

module.exports = function(app) {
  app
    .route("/api/threads/:board")
    .get(async function(req, res) {
      try {
        var doc = await Thread.find({ board: req.params.board },'created_on text _id replies bumped_on')
          .populate({
            path: "replies",
            perDocumentLimit: 3,
            options: { sort: "-created_on", projection: '-reported -delete_password' }
          })
          .sort("-bumped_on")
          .limit(10);
        res.json(doc);
      } catch (e) {
        console.log(e);
      }
    })

    .post(async function(req, res) {
      let board = req.params.board;
      let thread = req.body;
      thread.board = board;
      try {
        let doc = new Thread(thread);
        doc.save();
        res.redirect(`/b/${board}/`);
      } catch (e) {
        console.log(e);
      }
    })

    .put(async function(req, res) {
      const id = req.body.thread_id;
      try {
        var doc = await Thread.findByIdAndUpdate(
          id,
          { reported: true },
          { new: true }
        );
        res.json("success");
      } catch (e) {
        res.json(`error:` + e);
      }
    })

    .delete(async function(req, res) {
      const id = req.body.thread_id;
      const pwd = req.body.delete_password;
      try {
        let doc = await Thread.findOneAndDelete({
          _id: id,
          delete_password: pwd
        });
        doc ? res.json("success") : res.json("incorrect password");
      } catch (e) {
        res.json(`error: ${e}`);
      }
    });

  app
    .route("/api/replies/:board")
    .get(async function(req, res) {
      const id = req.query.thread_id;
      try {
        const doc = await Thread.findById({ _id: id }, 'created_on text _id replies bumped_on').populate({
          path: "replies",          
          options: { sort: "-created_on", projection: '-reported -delete_password'}
        });
        res.json(doc);
      } catch (e) {
        console.log(e);
      }
    })

    .post(async function(req, res) {
      var body = req.body;
      var thread = req.body.thread_id;
      var board = req.params.board;
      try {
        var reply = new Reply({
          text: body.text,
          delete_password: body.delete_password
        });
        reply.save();
        var doc = await Thread.findByIdAndUpdate(
          { _id: thread },
          {
            $push: { replies: reply },
            $inc: { replycount: 1 },
            $set: { bumped_on: time }
          },
          { upsert: true, new: true }
        );

        res.redirect(`/b/${board}/${thread}/`);
      } catch (e) {
        console.log(e);
      }
    })

    .put(async function(req, res) {
    const id = req.body.reply_id;
      try {
        var doc = await Reply.findByIdAndUpdate(
          id,
          { reported: true },
          { new: true }
        );
        res.json("success");
      } catch (e) {
        res.json(`error:` + e);
      }
  })

    .delete(async function(req, res) {
      const id = req.body.reply_id;
      const pwd = req.body.delete_password;
      const thread = req.body.thread_id;
      try {
        let doc = await Reply.findOneAndUpdate(
          {
            _id: id,
            delete_password: pwd
          },
          { text: "[deleted]" }
        );
        doc ? res.json("success") : res.json("incorrect password");
      } catch (e) {
        res.json(`error: ${e}`);
      }
    });
};
