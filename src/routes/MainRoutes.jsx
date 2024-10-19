import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));

// ==============================|| SETUP ROUTING ||============================== //
const AxelGroup = Loadable(lazy(() => import('pages/component-overview/axel-group')));
const VehicleType = Loadable(lazy(() => import('pages/component-overview/vehicle-type')));
const Vehicles = Loadable(lazy(() => import('pages/component-overview/vehicles')));


// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/weighing',
  element: <Dashboard />,
  children: [
    {
      path: 'default',
      element: <DashboardDefault />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'axel-group',
      element: <AxelGroup />
    },
    {
      path: 'vehicle-type',
      element: <VehicleType />
    },
    {
      path: 'sales',
      element: <Vehicles />
    }
  ]
};

export default MainRoutes;
