import { Outlet, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptopCode, faDiagramProject, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import './Layout.css';

export default function Layout() {
  return (
    <div className="app-container">
      <nav className="my-navbar">
        <div className="navbar-brand">
          <FontAwesomeIcon icon={faLaptopCode} />
          <span>Pyttern Visualizer</span>
        </div>
        <div className="navbar-links">
          <NavLink to="/" end>
            <FontAwesomeIcon icon={faDiagramProject} />
            <span>Matcher</span>
          </NavLink>
          <NavLink to="/compound">
            <FontAwesomeIcon icon={faNetworkWired} />
            <span>Compound</span>
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
