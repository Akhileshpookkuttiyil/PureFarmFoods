module.exports={
    getCart:(req,res)=>{
        res.render('cart', { title: 'cartPage' });
    },
}