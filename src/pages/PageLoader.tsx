import "../styles/PageLoader.css";

const PageLoader = () => {
  return (
    <div className="page-loader">
      <div className="book">
        <div className="page page-1"></div>
        <div className="page page-2"></div>
        <div className="page page-3"></div>
      </div>
      <p className="loading-text">Loading BookNest...</p>
    </div>
  );
};

export default PageLoader;
