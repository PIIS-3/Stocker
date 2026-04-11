import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

import Dashboard from './pages/admin/Dashboard';
import StoresList from './pages/admin/StoresList';
import UsersList from './pages/admin/UsersList';
import CategoriesList from './pages/admin/CategoriesList';
import ProductsList from './pages/admin/ProductsList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SuperAdmin', 'Manager', 'Staff']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="stores" element={<StoresList />} />
              <Route path="users" element={<UsersList />} />
              <Route path="categories" element={<CategoriesList />} />
              <Route path="products" element={<ProductsList />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;