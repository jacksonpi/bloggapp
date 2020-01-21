module.exports = {

 eadmin:function(req,res,next){

   if( req.idAuthenticated() && req.user.eadmin == 1){
      return next();
   }
   req.flash("error_msg","Você não está logado!")
   res.redirect("/")
 }

}