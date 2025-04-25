import React from "react";
import "../styles/Loader.css";

const Loader: React.FC = () => {
  return (
    <div className="loader-container">
      <div className="book-loader" />
      <p>Fetching your bookish world... 📚✨</p>
    </div>
  );
};

export default Loader;
