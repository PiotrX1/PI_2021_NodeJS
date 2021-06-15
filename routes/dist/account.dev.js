"use strict";

var _require = require('body-parser'),
    json = _require.json;

var express = require('express');

var _require2 = require('express-validator'),
    body = _require2.body,
    validationResult = _require2.validationResult;

var db = require('../knex');

var router = express.Router();
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'Logowanie'
  });
});
router.get('/register', function (req, res, next) {
  res.render('register', {
    title: 'Rejestracja'
  });
});
router.post('/register', function _callee(req, res) {
  var info, u;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          info = [];

          if (!body('email').isEmail()) {
            _context.next = 10;
            break;
          }

          req;
          _context.next = 5;
          return regeneratorRuntime.awrap(db('Users').where("Email", "qwerty@123.pl").first().then(function (row) {
            return row;
          }));

        case 5:
          u = _context.sent;
          console.log(req.body);

          if (u) {
            info.push("Użytkownik o takim adresie już istnieje");
          }

          _context.next = 11;
          break;

        case 10:
          info.push("Nieprawidłowy adres email");

        case 11:
          if (!body('password').isLength({
            min: 8
          })) {
            info.push("Hasło musi mieć minimum 8 znaków");
          }

          res.render('register', {
            title: 'Rejestracja',
            info: info
          });

        case 13:
        case "end":
          return _context.stop();
      }
    }
  });
});
module.exports = router;