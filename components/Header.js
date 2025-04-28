import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header = ({ isAuthenticated, user, isTeamsContext }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    // Clear the authentication token
    localStorage.removeItem('auth_token');
    // Redirect to home page
    router.push('/');
    // Reload page to reset auth state
    window.location.reload();
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">OKR Tree</h1>
          
          {isAuthenticated && (
            <nav className="ml-10 hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className={router.pathname === '/' ? 'font-bold' : ''}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/tasks" className={router.pathname === '/tasks' ? 'font-bold' : ''}>
                    Your Tasks
                  </Link>
                </li>
                <li>
                  <Link href="/o3-discussions" className={router.pathname === '/o3-discussions' ? 'font-bold' : ''}>
                    O3 Discussions
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
        
        <div className="flex items-center">
          {isAuthenticated ? (
            <>
              <div className="mr-4 text-sm hidden md:block">
                <span>Welcome, {user?.name}</span>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-primary-dark focus:outline-none"
                >
                  <span className="font-medium hidden md:block">{user?.name}</span>
                  <div className="h-8 w-8 rounded-full bg-primary-foreground text-primary flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
                    <Link href="/account" className="block px-4 py-2 hover:bg-gray-100">
                      Account Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/" className="py-2 px-4 rounded bg-white text-primary font-medium">
              Login
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isAuthenticated && (
        <div className="md:hidden container mx-auto px-4 pb-3">
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/" className={router.pathname === '/' ? 'font-bold' : ''}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/tasks" className={router.pathname === '/tasks' ? 'font-bold' : ''}>
                  Your Tasks
                </Link>
              </li>
              <li>
                <Link href="/o3-discussions" className={router.pathname === '/o3-discussions' ? 'font-bold' : ''}>
                  O3 Discussions
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;