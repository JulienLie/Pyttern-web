import { Routes, Route } from 'react-router-dom';
import Layout from './shared-components/navbar/Layout';
import { lazy, Suspense } from 'react';
import Compound from './pages/compound/Compound';
import AppLoader from './shared-components/app-loader/AppLoader';

const Matcher = lazy(() => import('./pages/matcher/Matcher'));

function App() {
  return (
    <>
      <AppLoader />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Matcher />} />
            <Route path='compound' element={<Compound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
