import React from "react";

const HighlightText = ({ text }: { text: string }) => {
    return (
        <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/90 mt-1 inline-block rounded-md px-3 py-1.5">
            {text}
        </span>
    );
};

export default HighlightText;
