class ApiError extends Error{
     /**
     * @param {number} statusCode - HTTP status code or custom status code.
     * @param {string} [message="Something went wrong"] - Error message.
     * @param {Array} [errors=[]] - Optional array for additional error details.
     * @param {string} [stack=""] - Optional custom stack trace.
     */
    constructor(statusCode , message="Something went wrong" ,errors = [] ,stack =""){
        super(message);
        this.statusCode = statusCode;
        this.errors = errors ;
        this.success = false ;
        
        if (stack) {
            this.stack = stack ; 
        } else {
            Error.captureStackTrace(this , this.constructor);            
        }
    }
} 

export { ApiError }
