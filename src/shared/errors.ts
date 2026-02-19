export class ApiError extends Error {
    /**
     * Status Code
     * @type number
     * */
    public statusCode: number;

    constructor(statusCode: number, message?: string) {
        super(message);
        this.name = this.constructor.name
        this.statusCode = statusCode;
    }
}