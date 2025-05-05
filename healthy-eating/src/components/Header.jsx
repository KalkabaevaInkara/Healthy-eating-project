import { useState } from "react";
import { Link } from "react-router-dom";

function Header({ toggleSidebar, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="/logo1.webp" alt="Healthy Eating Logo" className="logo-image" />
        </Link>
      </div>

      <nav className="nav-container">
        <ul className="nav-left">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/catalog">Каталог</Link></li>
          <li><Link to="/meal-planner">Планировщик питания</Link></li>
        </ul>
        <ul className="nav-right">
          <li>
            <Link to="/login">
              <img src="/login_icon.png" alt="Login Icon" className="login-icon" />
              Вход
            </Link>
          </li>
          <li><Link to="/profile">Личный кабинет</Link></li>
          <li>
            <label id="switch" className="theme-toggle-switch">
              <input type="checkbox" onChange={toggleTheme} id="slider" />
              <span className="theme-toggle-slider round"></span>
            </label>
          </li>
        </ul>
        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/" onClick={toggleMenu}>Главная</Link></li>
          <li><Link to="/catalog" onClick={toggleMenu}>Каталог</Link></li>
          <li><Link to="/meal-planner" onClick={toggleMenu}>Планировщик питания</Link></li>
          <li><Link to="/login" onClick={toggleMenu}>Вход</Link></li>
          <li><Link to="/profile" onClick={toggleMenu}>Личный кабинет</Link></li>
          <li>
            <label id="switch" className="theme-toggle-switch">
              <input type="checkbox" onChange={toggleTheme} id="slider" />
              <span className="theme-toggle-slider round"></span>
            </label>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;