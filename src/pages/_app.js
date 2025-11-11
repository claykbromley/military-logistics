import '../index.css';
import '../Navbar.css';
import '../pages/financial/financial.css';
import '../pages/automotive/automotive.css';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
