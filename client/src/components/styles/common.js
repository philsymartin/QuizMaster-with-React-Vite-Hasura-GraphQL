// Animation variants
export const motionContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const motionItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};