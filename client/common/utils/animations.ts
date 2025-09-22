export const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 50 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            duration: 0.6,
            delay,
            ease: "easeInOut",
        },
    },
});
