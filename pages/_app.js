import '../src/index.css';
import '../src/Navbar.css';
import '../src/pages/financial/financial.css';
import '../src/pages/automotive/automotive.css';
import Layout from '../src/components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
