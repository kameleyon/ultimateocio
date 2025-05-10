import { capture } from "./utils.js";
/**
 * Creates a standard error response for tools
 * @param message The error message
 * @returns A ServerResult with the error message
 */
export function createErrorResponse(message) {
    capture('server_request_error', {
        error: message
    });
    return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
    };
}
