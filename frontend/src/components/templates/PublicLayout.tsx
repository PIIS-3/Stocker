import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../organisms/Navbar';
import { Footer } from '../organisms/Footer';

export function PublicLayout() {
  const { pathname } = useLocation();
  const isLoginPage = pathname === '/login';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <div className="flex-grow w-full">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
