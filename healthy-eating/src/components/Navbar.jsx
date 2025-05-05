import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Главная</Link></li>
        <li><Link to="/catalog">Каталог</Link></li>
        <li><Link to="/meal-planner">Планировщик питания</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
