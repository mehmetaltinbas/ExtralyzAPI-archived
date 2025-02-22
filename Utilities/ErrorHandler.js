const errorHandler = (fn) => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Error in ${fn.name} -->`, error.stack);
            return {
                success: false,
                message: `Error in ${fn.name}`,
                error: error.message,
            };
        }
    };
};


export { errorHandler }