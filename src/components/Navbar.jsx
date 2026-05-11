import "./navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <input
        type="text"
        placeholder="Search..."
      />

      <div className="nav-right">
        <button>Export</button>
      </div>
    </div>
  );
};

export default Navbar;