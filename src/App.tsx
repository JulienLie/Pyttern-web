import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { lazy, Suspense } from 'react';

const Matcher = lazy(() => import('./pages/Matcher'));
const Macros = lazy(() => import('./pages/Macros'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Matcher />} />
          <Route path="macros" element={<Macros />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
