
const profile =(req, res) => {
    if(req.session && req.session.user) {
        res.render('profile', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
    
}

module.exports = profile;