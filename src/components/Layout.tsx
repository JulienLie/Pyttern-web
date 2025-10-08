import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css'; // optional CSS file

export default function Layout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <nav>
          <ul>
            <li><NavLink to="/" end>Matcher</NavLink></li>
            <li><NavLink to="/macros">Macros</NavLink></li>
            {/* Add more links as needed */}
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
