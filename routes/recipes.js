var express = require('express');

var crypto = require('crypto');


const db = require('../knex');
const { default: knex } = require('knex');


var router = express.Router();



router.get('/', async function(req, res, next) {


  const type = req.query.type;
  const author = req.query.author;
  const difficulty = req.query.difficulty;


  var sql = `Select Recipes.Id, Title, Users.Username, Image, Types.Name as TypeName, Difficulty
  From Recipes
  JOIN Users ON Users.Id = Recipes.User
  JOIN Types ON Recipes.Type = Types.Id `;

  var where = "WHERE 1=1 ";


  if(type > 0)
  {
    where += `AND Recipes.Type = ` + type + " ";
  }
  if(author)
  {
    where += `AND Users.Username LIKE '` + author + `'`;
  }
  if(difficulty > 0)
  {
    where += `AND Difficulty = ` + difficulty;
  }

  sql += where;

  console.log(sql);


  var recipes = await db.raw(sql);


  //var recipes = await db.select("Recipes.Id", "Title", "Users.Username", "Image", "Types.Name as TypeName", "Difficulty").from("Recipes").where("Recipes.Type", "=", "2").join("Users", "Users.Id", "=", "Recipes.User").join("Types", "Recipes.Type", "=", "Types.Id");

  var types = await db("Types");

  res.render('recipes', { title: 'Przepisy', recipes: recipes, types:types});
});



router.get('/Add', async function(req, res, next) {

  if(!req.session.User)
    res.redirect("/Account/Login");



  var types = await db("Types");


  res.render('addrecipes', { title: 'Dodaj przepis', types: types});
});


router.post('/add', async(req, res) => {
  if(!req.session.User)
    res.redirect("/Account/Login");
  

  var info;

  const title = req.body.title;
  const text = req.body.text;
  const difficulty = req.body.difficulty;
  const type = req.body.type;
  const ingredients = req.body.ingredients;

  var date = Date.now();


  var file = req.files.image;








  if(title && text && difficulty && type && ingredients && file)
  {
    
    
    var foldername = crypto.createHash('md5').update(file.name).digest("hex");


    var fs = require('fs');

    if (!fs.existsSync('public/uploads/' + foldername)){
      fs.mkdirSync('public/uploads/' + foldername);
    }



    uploadPath = 'public/uploads/' + foldername + '/' + file.name;


    var imgurl = '/uploads/' + foldername + '/' + file.name;

    file.mv(uploadPath);

    await db("Recipes").insert({
      User: req.session.User.Id,
      Title: title,
      Image: imgurl,
      Text: text,
      Date: date,
      Difficulty: difficulty,
      Type: type,
      Ingredients: ingredients
    });

    info = "Dodano";
  }
  else
  {
    info = "Wypełnij wszystkie pola";
  }

  

  var types = await db("Types");


  res.render('addrecipes', { title: 'Dodaj przepis', info:info, types: types});
});


router.get('/:id', async function(req, res, next) {


  var recipe = await db.select("Recipes.Id", "Title", "Users.Username", "Image", "Text", "Date", "Difficulty", "Ingredients").from("Recipes").join("Users", "Users.Id", "=", "Recipes.User").where("Recipes.Id", req.params.id).first();


  var comments = await db.select("Comments.Id", "Text", "Users.Username").from("Comments").where("Comments.Recipe", req.params.id).join("Users","Users.Id", "=", "Comments.User");

  res.render('recipe', { title: recipe.Title, recipe:recipe, comments:comments});



});

router.get('/:id/del/:comment', async function(req, res, next) {

  if(!req.session.User.Admin == 1)
    res.redirect("/Recipes/" + req.params.id);


  await db("Comments").where("Id", req.params.comment).del();

  res.redirect("/Recipes/" + req.params.id);

});
router.get('/:id/DeleteRecipe', async function(req, res, next) {

  if(!req.session.User.Admin == 1)
    res.redirect("/Recipes/" + req.params.id);


  await db("Recipes").where("Id", req.params.id).del();

  res.redirect("/Recipes/");

});

router.post('/:id', async function(req, res) {

  var text= req.body.text;


  if(text)
  {
    await db("Comments").insert({
      User: req.session.User.Id,
      Recipe: req.params.id,
      Date: Date.now(),
      Text: text
    });
  }

  console.log(text);
  res.redirect("/Recipes/" + req.params.id);
 
});




module.exports = router;
