const islogin =async (req,res,next)=>{
    try {
        console.log(req.session.User_Id);
        if(req.session.User_Id){}
        else{
            res.redirect('/empty');
        }
        next()
    } catch (error) {
        console.log(error);
    }
}
const islogut =(req,res,next)=>{
    try {
        if(!req.session.User_Id){
          return next()
        }
        res.redirect('/home');
    } catch (error) {
        console.log(error);
    }
}
module.exports ={
    islogin,
    islogut
}