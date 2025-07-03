const errorHandler = (fn ) => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(
                `\t Error in ${fn.name} \n Error message --> ${error.message} \n Error stack -->`,
                error.stack,
            );
            return {
                isSuccess: false,
                source: fn.name,
                message: error.message,
            };
        }
    };
};

export { errorHandler };
