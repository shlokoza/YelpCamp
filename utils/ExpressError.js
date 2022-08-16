//setting a constructor for custom errors
class ExpressErorr extends Error{
    constructor(message, statusCode){
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressErorr;