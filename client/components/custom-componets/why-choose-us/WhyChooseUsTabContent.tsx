import React from "react";

const TabContent = ({ description }: { description: string }) => {
    return <p className="mt-2 text-lg text-gray-700 transition-opacity duration-300">{description}</p>;
};

export default TabContent;
