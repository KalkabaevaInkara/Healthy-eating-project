import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer-nav-container">
      <div className="footer__info">
        <div className="footer__logo">
          <Link to="/">
            <img src="/logo1.webp" alt="Healthy Eating Logo" className="logo-image" />
          </Link>
          <h1>HEALTHY EATING</h1>
        </div>
        <p>© 2025 Healthy Eating. Все права защищены.</p>
      </div>

      <div className="footer-columns">
        <ul className="footer-nav-left">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/catalog">Каталог</Link></li>
          <li><Link to="/meal-planner">Планировщик питания</Link></li>
        </ul>
        <ul className="footer-nav-right">
          <li>
            <Link to="/login">
              <img src="/login_icon.png" alt="Login Icon" className="footer-login-icon" />
              Вход
            </Link>
          </li>
          <li><Link to="/profile">Личный кабинет</Link></li>
          <li><Link to="/register">Регистрация</Link></li>
        </ul>
        <ul className="footer-socials">
          <li><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">instagram</a></li>
          <li><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">facebook</a></li>
          <li><a href="https://www.twitter.com/" target="_blank" rel="noopener noreferrer">twitter</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
