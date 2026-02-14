import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '../common/components/navbar/Layout.tsx';
import { lazy, Suspense } from 'react';
import Compound from '../features/compound/view/Compound.tsx';
import AppLoader from '../common/components/app-loader/AppLoader.tsx';

const Matcher = lazy(() => import('../features/matcher/view/Matcher.tsx'));

function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
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
