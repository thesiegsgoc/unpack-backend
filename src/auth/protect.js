module.exports = {
    protectRoute: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    },
    allowIf: (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/dashboard');
    }
};