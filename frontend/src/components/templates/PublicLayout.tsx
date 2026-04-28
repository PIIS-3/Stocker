import { Outlet } from 'react-router-dom';
import { Navbar } from '../organisms/Navbar';
import { Footer } from '../organisms/Footer';

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
