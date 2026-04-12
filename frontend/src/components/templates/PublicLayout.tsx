import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '../organisms';

export function PublicLayout() {
  return (
    <>
      <Navbar />
      <div className="flex-grow w-full">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
