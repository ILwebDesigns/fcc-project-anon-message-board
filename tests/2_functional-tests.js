/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");
var expect = require("chai").expect;

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("Test POST New thread /api/threads/:board", function(done) {
        chai
          .request(server)
          .post("/api/threads/testboard")
          .send({
            board: "testboard",
            text: "test_thread",
            delete_password: "asd"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            expect(res).to.be.html;
            done();
          });
      });
    });

    suite("GET", function() {
      test("Test GET New thread /api/threads/:board", function(done) {
        chai
          .request(server)
          .get("/api/threads/testboard")
          .end(function(err, res) {
            var body = res.body;
            assert.equal(res.status, 200);
            assert.isObject(res, "respond is an array");
            assert.isObject(body[0], "first element is an Object");
            assert.isObject(body[1], "second element is an Object");
            assert.property(body[0], "_id");
            assert.property(body[0], "text");
            assert.property(body[0], "created_on");
            assert.property(body[0], "bumped_on");
            assert.notProperty(body[0], "reported");
            assert.notProperty(body[0], "delete_password");
            assert.isArray(body[0].replies, "respond is an array");
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("DELETE thread /api/threads/:board INCORRECT PASSWORD", function(done) {
        chai
          .request(server)
          .delete("/api/threads/general")
          .send({
            thread_id: "5e8e51e3ef3a4172ac519f7b",
            delete_password: "asd1"
          })
          .end(function(err, res) {
            var body = res.body;
            assert.equal(res.status, 200);
            assert.equal(res.body, "incorrect password");
            done();
          });
      });
      /* test("DELETE thread /api/threads/:board SUCCESS", function(done) {
        chai
          .request(server)
          .delete("/api/threads/general")
          .send({
            thread_id: "5e8e51e3ef3a4172ac519f7b",
            delete_password: "asd"
          })
          .end(function(err, res) {
            var body = res.body;
            assert.equal(res.status, 200);
            assert.equal(res.body, "success");
            done();
          });
      });*/
    });

    suite("PUT", function() {
      test("PUT thread /api/threads/:board SUCCESS", function(done) {
        chai
          .request(server)
          .put("/api/threads/general")
          .send({
            thread_id: "5e8e4810a8bebd4cc4c9d5a1",
            board: "general"
          })
          .end(function(err, res) {
            var body = res.body;
            assert.equal(res.status, 200);
            assert.equal(res.body, "success");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {
      test("POST REPLY /api/replies/:board SUCCESS", function(done) {
        chai
          .request(server)
          .post("/api/replies/general")
          .send({
            thread_id: "5e8e350bc62598342f7f9c37",
            board: "general",
            text: "test",
            delete_password: "asd"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            expect(res).to.be.html;
            done();
          });
      });
    });

    suite("GET", function() {
      test("GET REPLY /api/replies/:board", function(done) {
        chai
          .request(server)
          .get("/api/replies/general?thread_id=5e8e350bc62598342f7f9c37")
          .send({
            thread_id: "5e8e350bc62598342f7f9c37",
            board: "general"
          })
          .end(function(err, res) {
            var body = res.body;
            assert.equal(res.status, 200);
            assert.property(body, "_id");
            assert.isObject(body, "body is an object");
            assert.property(body, "replies");
            assert.notProperty(body, "reported");
            assert.notProperty(body, "delete_password");
            assert.isObject(body.replies[0], "replies is an Object");
            assert.property(body.replies[0], "created_on");
            done();
          });
      });
    });

    suite("PUT", function() {
      test("PUT REPLY /api/threads/:board SUCCESS", function(done) {
        chai
          .request(server)
          .put("/api/threads/general")
          .send({
            thread_id: "5e8e4810a8bebd4cc4c9d5a1",
            board: "general"
          })
          .end(function(err, res) {
            var body = res.body;
            assert.equal(res.status, 200);
            assert.equal(body, "success");
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("DELETE REPLY /api/threads/:board INCORRECT PASSWORD", function(done) {
        chai
          .request(server)
          .delete("/api/replies/general")
          .send({
            reply_id: "5e8e6675b4212b4276c8fa48",
            delete_password: "test1"
          })
          .end(function(err, res) {
            var body = res.body;
            assert.equal(res.status, 200);
            assert.equal(body, "incorrect password");
            done();
          });
      });
      /* test("DELETE REPLY /api/threads/:board SUCCESS", function(done) {
        chai
          .request(server)
          .delete("/api/replies/general")
          .send({
            reply_id: "5e8e51e3ef3a4172ac519f7b",
            delete_password: "asd"
          })
          .end(function(err, res) {
            var body = res.body;
            assert.equal(res.status, 200);
            assert.equal(res.body, "success");
            done();
          });*/
    });
  });
});
