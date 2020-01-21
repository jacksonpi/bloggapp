const express = require('express') //npm install --save express
const handlebars = require('express-handlebars')//npm install --save express-handlebars
const bodyParser = require('body-parser')//npm install --save body-parser
const admin = require("./routes/admim")
const app = express()
const path = require("path")
const mongoose = require('mongoose')
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categorias")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuarios")
const passport = require("passport")
require("./config/auth")(passport)
const db = require("./config/db")
//Configurações 

 //Session
  app.use(session({
    secret:"jackson123",
    resave:true,
    saveUninitialized:true
  }))

 app.use(passport.initialize())
 app.use(passport.session())

  app.use(flash())
  //MidleWare
  app.use((req,res,next)=>{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
  })
 //Body-Parser
  app.use(bodyParser.urlencoded({extended:true}))
  app.use(bodyParser.json())
 //Handlebars
  app.engine('handlebars',handlebars({defaultLayout:'main'}))
  app.set('view engine','handlebars')
  //Mongoose
  mongoose.Promise = global.Promise
  mongoose.connect(db.mongoURI).then(()=>{
    console.log("BD Conectado!")
  }).catch((erro)=>{
    console.log("Erro ao conectar:"+erro)
  })
//Public
  app.use(express.static(path.join(__dirname,"public"))) //dirname pega o diretório absoluto
//Rotas

   app.get('/',(req,res)=>{
     Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens)=>{
      res.render("index",{postagens:postagens})
     }).catch((erro)=>{
       req.flash("error_msg","Houve um erro interno!")
       res.redirect("/404")
     })
   })

   app.get("/postagem/:slug",(req,res)=>{
     Postagem.findOne({slug:req.params.slug}).then((postagem)=>{
       if(Postagem){
           res.render("postagem/index",{postagem:postagem})
       }else{
           req.flash("error_msg","Esta postagem não existe!")
           res.redirect("/")
       }
     }).catch((error)=>{
      req.flash("error_msg","Ouve um erro interno!")
      res.redirect("/")
     })
   })

   app.get("/categorias",(req,res)=>{
     Categoria.find().then((categorias)=>{
       res.render("categorias/index",{categorias:categorias})
     }).catch((error)=>{
       req.flash("error_msg","Houve um erro ao listar categorias!")
       res.redirect("/")
     })
   })

   app.get("/categorias/:slug",(req,res)=>{
     Categoria.findOne({slug:req.params.slug}).then((categoria)=>{
       if(categoria){
          Postagem.find({categoria:categoria._id}).then((postagens)=>{
                 res.render("categorias/postagens",{postagens:postagens,categoria:categoria})
          }).catch((error)=>{
            req.flash("error_msg","Houve um erro ao listar os posts!")
            res.redirect("/")
          })
       }else{
        req.flash("error_msg","Esta categoria não existe!")
       }
     }).catch((error)=>{
        req.flash("error_msg","Houve um erro interno ao carregar a página desta categoria!")
        res.redirect("/")
     })
   })

   app.get("/404",(req,res)=>{
     res.send("Erro 404!")
   })
 
   app.use('/admin',admin)
   app.use('/usuarios',usuarios)

//Outros
const PORT = process.env.PORT || 8081
app.listen(PORT,()=>{
    console.log("SERVIDOR RODANDO")
})

