import { useEffect } from 'react';
import { Outlet, NavLink, useBlocker, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptopCode, faDiagramProject, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector, useAppDispatch } from '../../hooks.ts';
import { resetState } from '../../../features/compound/compoundSlice.ts';
import { resetMatcher } from '../../../features/matcher/matcherSlice.ts';
import ConfirmationModal from '../confirmation-modal/ConfirmationModal.tsx';
import AppLoader from '../app-loader/AppLoader.tsx';
import './Layout.css';

export default function Layout() {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const { codeFiles, compoundPattern } = useAppSelector((s) => s.compound);
  const { patternCode, code } = useAppSelector((s) => s.matcher);

  const isCompoundDirty = codeFiles.length > 0 || compoundPattern !== null;
  const isMatcherDirty = patternCode !== '' || code !== '';
  const isDirty = location.pathname === '/' ? isCompoundDirty : isMatcherDirty;

  const blocker = useBlocker(isDirty);

  // Handle browser close / tab close / refresh
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleConfirm = () => {
    switch (location.pathname) {
      case '/':
        dispatch(resetState());
        break;
      case '/matcher':
        dispatch(resetMatcher());
        break;
      default:
        break;
    }
    blocker.proceed?.();
  };

  const handleCancel = () => {
    blocker.reset?.();
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
      <AppLoader />
      <div className="app-container">
        <nav className="my-navbar">
          <div className="navbar-brand">
            <FontAwesomeIcon icon={faLaptopCode} />
            <span>Pyttern Visualizer</span>
          </div>
          <div className="navbar-links">
            <NavLink to="/">
              <FontAwesomeIcon icon={faNetworkWired} />
              <span>Compound</span>
            </NavLink>
            <NavLink to="/matcher" end>
              <FontAwesomeIcon icon={faDiagramProject} />
              <span>Matcher</span>
            </NavLink>
          </div>
        </nav>
        <main className="main-content">
          <Outlet />
        </main>
        <ConfirmationModal
          isOpen={blocker.state === 'blocked'}
          questionContent="All data on this page will be lost. Do you want to leave?"
          onApprove={handleConfirm}
          onDecline={handleCancel}
          onRequestClose={handleCancel}
          isConfirmPositive={false}
        />
      </div>
    </>
  );
}
