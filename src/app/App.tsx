import { createBrowserRouter } from 'react-router-dom';
import Layout from '../common/components/navbar/Layout.tsx';
import Compound from '../features/compound/view/Compound.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Compound /> },
      {
        path: 'matcher',
        lazy: () => import('../features/matcher/view/Matcher.tsx').then((m) => ({ Component: m.default })),
      },
    ],
  },
]);
