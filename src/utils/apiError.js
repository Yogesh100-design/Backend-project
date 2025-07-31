class apiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors=[],
        stack=""
    ){
        super(message)
        this.statusCode = statusCode; // HTTP status code (e.g. 404, 500)
        this.message = message;       // Main error message
        this.errors = errors;         // Extra error details (array)
        this.data = null;             // No data on error
        this.success = false;         // Always false on error

        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export default {apiError}