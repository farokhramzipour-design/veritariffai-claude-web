import { cookies } from 'next/headers';
import { Header } from './Header';

const HeaderWrapper = () => {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token');
  const isAuthenticated = !!token;

  return <Header isAuthenticated={isAuthenticated} />;
};

export default HeaderWrapper;
