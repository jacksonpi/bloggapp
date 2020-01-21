const express = require('express')
const routes = express.Router()
const mongoose = require("mongoose")
require("../models/Categorias")
const Categoria = mongoose.model("categorias")
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
const {eadmin} = require("../helpers/eadmin")
require("../models/Contato")
const Contato = mongoose.model("contatos")

routes.get('/',eadmin,(req,res)=>{
    res.render("admin/index")
})

routes.get('/categorias',(req,res)=>{
        Categoria.find().sort({date:"desc"}).then((categorias)=>{
        res.render("admin/categorias",{categorias:categorias})
    }).catch((erro)=>{
        req.flash("error_msg","Houve um errro ao listar categorias!")
        res.redirect("/admin")
    })
})

routes.post("/categorias/nova",(req,res)=>{

var erros = []

if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto:"Nome inválido"})
}

if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto:"Slug inválidos"})
}

if(req.body.nome.length < 5){
    erros.push({texto:"Nome da categoria muito pequeno!"})
}

if(erros.length > 0){
    res.render("admin/addcategorias",{erros:erros})
}else{
    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }
    new Categoria(novaCategoria).save().then(()=>{
        req.flash("success_msg","Categoria criada com sucesso! ")
        res.redirect("/admin/categorias")
    }).catch((erro)=>{
        req.flash("erro_msg","Houve um erro ao salvar!")
        res.redirect("/admin")
    })
}

})

routes.get("/categorias/edit/:id",(req,res)=> {
    Categoria.findOne({_id:req.params.id}).then((categoria)=>{
        res.render("admin/editcategorias",{categoria:categoria})
    }).catch((erro)=>{
        req.flash("error_msg","Está categoria não existe")
        res.redirect("admin/categorias")
    })
    
})

routes.post("/categorias/edit",(req,res)=>{

  Categoria.findOne({_id: req.body.id}).then((categoria)=>{
     
    categoria.nome = req.body.nome
    categoria.slug = req.body.slug

    categoria.save().then(()=>{
        req.flash("success_msg","Categoria editada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((erro)=>{
        req.flash("erro_msg", "Houve um erro ao salvar categoria!")
        res.redirect("/admin/categorias")
    })

  }).catch((erro)=>{
    req.flash("error_msg", "Houve um erro ao editar a categoria!")
    res.redirect("/admin/categorias")
  })

})

routes.post("/categorias/deletar",(req,res)=>{
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg","Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((erro)=>{
        req.flash("erro_msg","Houve um erro ao deletar categoria!")
        res.redirect("/admin/categorias")
    })
})

routes.get('/categorias/add',(req,res)=>{
    res.render("admin/addcategorias")
})

routes.get("/postagens",(req,res)=>{
    Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("admin/postagens",{postagens:postagens})
    }).catch((erro)=>{
        req.flash("error_msg", "Houve um erro ao listar postagens!")
        res.redirect("/admin")
    })
})

routes.get("/postagens/add",(req,res)=>{
    Categoria.find().then((categorias)=>{
        res.render("admin/addpostagem",{categorias:categorias})
    }).catch((erro)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
})

routes.post("/postagens/nova",(req,res)=>{

   var erros = []

   if (req.body.categoria == "0"){
       erros.push({text:"Categoria inválida, registre uma categoria"})
   }

   if (erros.length>0){
       res.render("admin/addpostagem",{erros:erros})
   }else{
       const NovaPostagem ={
           titulo:req.body.titulo,
           descricao:req.body.descricao,
           conteudo:req.body.conteudo,
           slug:req.body.slug,
           categoria:req.body.categoria
       }

       new Postagem(NovaPostagem).save().then(()=>{
        req.flash("success_msg","Postagem criada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((erro)=>{
        req.flash("error_msg","Houve um erro durante o salvamento da postagem")
        res.redirect("/admin/postagens")
    })
   }

})

routes.get("/postagens/edit/:id",(req,res)=>{
    
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{

        Categoria.find().then((categorias)=>{
            res.render("admin/editpostagens",{categorias: categorias, postagem:postagem})
       }).catch((error)=>{
           req.flash("error_msg", "Houve um erro ao listar categorias!")
           res.redirect("/admin/postagens")
       })
       
    }).catch((error)=>{
        req.flash("error_msg","Houve um erro ao carregat formulário!")
        res.redirect("/admin/postagens")
    })
})

routes.post("/postagens/edit",(req,res)=>{
   
     Postagem.findOne({_id:req.body.id}).then((postagem)=>{

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg","Salvo com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((error)=>{
            req.flash("error_msg","Houve um erro ao salvar")
            res.redirect("/admin/postagens")
        })

     }).catch((error)=>{
        req.flash("error_msg","Houve um erro ao salvar!")
        res.redirect("/admin/postagens")     })
})

routes.post("/postagens/deletar",(req,res)=>{
    Postagem.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg","Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((erro)=>{
        req.flash("erro_msg","Houve um erro ao deletar postagem!")
        res.redirect("/admin/postagens")
    })
})

routes.get("/contatos",(req,res)=>{
   res.render("admin/contatos")
})

routes.post("/contatos",(req,res)=>{
    const novoContato = {
        nome: req.body.nome,
        email: req.body.email,
        motivo:req.body.motivo,
        mensagem: req.body.mensagem
    }
    new Contato(novoContato).save().then(()=>{
        req.flash("success_msg","Mensagem enviada!!")
        res.redirect("/admin/contatos")
    }).catch((erro)=>{
        req.flash("erro_msg","Houve um erro ao enviar, tente novamente!")
        res.redirect("/admin/contatos")
    })
 })

 routes.get("/busca",(req,res)=>{
    res.render("admin/busca")
 })

 routes.get("/sobre",(req,res)=>{
     res.render("admin/sobre")
 })

module.exports = routes