export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="px-8 py-5 border-t border-outline-variant/30 dark:border-gray-800 bg-surface-lowest/95 dark:bg-gray-900/95">
      <div className="flex items-center justify-between font-body text-xs text-gray-500 dark:text-gray-400">
        <p>
          &copy; {currentYear}{' '}
          <span className="font-semibold text-primary">FoodShare VN</span>. All
          rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary transition-colors">
            Điều khoản
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Bảo mật
          </a>
          <span className="text-gray-300 dark:text-gray-600">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
