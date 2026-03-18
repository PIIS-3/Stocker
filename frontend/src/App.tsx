import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

import { AdminLayout } from './components/admin/AdminLayout';
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
          {/* Main Public Routes Layout */}
          <Route path="/" element={
            <>
              <Navbar />
              <div className="flex-grow w-full">
                <Home />
              </div>
              <Footer />
            </>
          } />
          
          {/* Other Public Layouts */}
          <Route path="/login" element={<><Navbar /><div className="flex-grow w-full"><Login /></div><Footer /></>} />
          <Route path="/contacto" element={<><Navbar /><div className="flex-grow w-full"><Contact /></div><Footer /></>} />
          <Route path="/privacidad" element={<><Navbar /><div className="flex-grow w-full"><Privacy /></div><Footer /></>} />
          <Route path="/terminos" element={<><Navbar /><div className="flex-grow w-full"><Terms /></div><Footer /></>} />

          {/* Admin Routes with nested layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="stores" element={<StoresList />} />
            <Route path="users" element={<UsersList />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App