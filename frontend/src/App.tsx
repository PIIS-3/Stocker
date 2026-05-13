import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/templates';
import { ScrollToTop } from './components/atoms/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Roadmap from './pages/Roadmap';

import { AdminLayout } from './components/templates';
import Dashboard from './pages/admin/Dashboard';
import StoresList from './pages/admin/StoresList';
import UsersList from './pages/admin/UsersList';
import CategoriesList from './pages/admin/CategoriesList';

import ProductsList from './pages/admin/ProductsList';
import Settings from './pages/admin/Settings';
import { ProtectedRoute, RoleProtectedRoute } from './components/atoms';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="font-sans antialiased text-gray-900 bg-gray-50 flex flex-col min-h-screen">
        <Routes>
          {/* Rutas públicas — comparten Navbar y Footer a través de PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="roadmap" element={<Roadmap />} />
          </Route>

          {/* Rutas del panel de administración — protegidas por token */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="categories" element={<CategoriesList />} />

              {/* Rutas restringidas: Solo accesibles para SuperAdmin */}
              <Route element={<RoleProtectedRoute allowedRoles={['SuperAdmin']} />}>
                <Route path="stores" element={<StoresList />} />
                <Route path="users" element={<UsersList />} />
              </Route>

              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Ruta comodín — redirige rutas desconocidas al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
