class ApiResponce {
    constructor(statusCode, message, data = "success") {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data; // ✅ FIXED HERE
        this.success = statusCode < 400;
    }
}

export default ApiResponce;
