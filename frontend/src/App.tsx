import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/templates/PublicLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Roadmap from './pages/Roadmap';

import { AdminLayout } from './components/templates/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import StoresList from './pages/admin/StoresList';
import UsersList from './pages/admin/UsersList';
import CategoriesList from './pages/admin/CategoriesList';
import ProductsList from './pages/admin/ProductsList';

function App() {
  return (
    <Router>
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

          {/* Rutas del panel de administración — layout con Sidebar */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="stores" element={<StoresList />} />
            <Route path="users" element={<UsersList />} />
          </Route>

          {/* Ruta comodín — redirige rutas desconocidas al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
