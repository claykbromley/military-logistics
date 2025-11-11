import Navbar from '../Navbar';

export default function Layout({ children }) {
  return (
    <div className="page">
      <Navbar />
      {children}
    </div>
  );
}
