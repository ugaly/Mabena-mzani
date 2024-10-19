import { PrimeReactProvider } from 'primereact/api'; // PrimeReactProvider for global settings
import { RouterProvider } from 'react-router-dom';
import router from 'routes';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';



// PrimeReact imports
import 'primereact/resources/primereact.min.css'; // core css
import 'primereact/resources/themes/saga-blue/theme.css'; // theme css
import 'primeicons/primeicons.css'; // icons css

// Optional: Import PrimeFlex for layout
import 'primeflex/primeflex.css'; // primeflex grid system (optional)


export default function App() {
  const primeReactConfig = {
    ripple: true, // Enable ripple effect globally
    inputStyle: 'filled', // Set the global input style (outlined or filled)
  };

  return (
    <PrimeReactProvider value={primeReactConfig}> {/* PrimeReact global config */}
      <ThemeCustomization>
        <ScrollTop>
          <RouterProvider router={router} />
        </ScrollTop>
      </ThemeCustomization>
    </PrimeReactProvider>
  );
}

