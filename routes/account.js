const { json } = require('body-parser');
var express = require('express');
const { body, validationResult } = require('express-validator');
var crypto = require('crypto');

const db = require('../knex');
const session = require('express-session');
const { Session } = require('inspector');

var router = express.Router();


router.get('/', function(req, res, next) {
  if(!req.session.User)
    res.redirect("/Account/Login");

  res.redirect("/Recipes/");
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Logowanie' });
});
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Rejestracja' });
});
router.get('/logout', function(req, res, next) {
  delete req.session.User;
  res.redirect('/Account/Login');
});

router.post('/register', async(req, res) => {


  var info;
  var error;

  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;



  if((username && email && password && password2))
  {
    if(password == password2)
    {
      if(password.length >= 8)
      {
        if(body('email').isEmail())
        {
          
  
          var u = await db('Users').where("Email", email).first().then((row) => row);
          
          if(u)
          {
            error = "Użytkownik o takim adresie już istnieje";
          }
          else
          {
            var u2 = await db('Users').where("Username", username).first().then((row) => row);

            if(u2)
            {
              error = "Nazwa użytkownika jest zajęta";
            }
            else
            {
              await db('Users').insert({
                Username: username,
                Email: email,
                Password: crypto.createHash('md5').update(password).digest("hex")
              });

              info = "Konto utworzone.";

            }


          }

        }
        else
        {
          error = "Podaj poprawny adres email.";  
        }

      }
      else
      {
        error = "Hasło musi mieć minimum 8 znaków.";
      }
    }
    else
    {
      error = "Hasła nie są takie same."
    }



  }
  else
  {
    error = "Niekompletne dane."
  }

   

  res.render('register', { title: 'Rejestracja', info: info, error: error});

});


var sessionData;

router.post('/login', async(req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  var error;

  if(username && password)
  {

    var pass = crypto.createHash('md5').update(password).digest("hex");

    var u = await db('Users').where("Username", username).where("Password", pass).first().then((row) => row);
    


    if(u)
    {
      req.session.User = {
        Id: u.Id,
        Username: u.Username,
        Email: u.Email,
        Admin: u.Admin
      }
      res.redirect("/Account");
    }
    else
    {
      error = "Błędne dane.";
    }
    
  }
  else
  {
    error = "Podaj login i hasło."
  }

  res.render('login', { title: 'Rejestracja', error: error});

});







module.exports = router;
