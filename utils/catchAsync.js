//catching errors from the passed function
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}