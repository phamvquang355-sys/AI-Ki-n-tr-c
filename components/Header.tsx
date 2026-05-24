import React from "react";
import { Logo } from "./common/Logo";

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const GalleryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

interface HeaderProps {
  onGoHome: () => void;
  onThemeToggle: () => void;
  theme: "light" | "dark";
  onOpenGallery?: () => void;
  onToggleNav?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onThemeToggle,
  theme,
  onOpenGallery,
  onToggleNav,
}) => {
  return (
    <header className="bg-surface/80 dark:bg-[#121212]/80 backdrop-blur-md shadow-sm sticky top-0 z-40 transition-colors duration-300 px-3 sm:px-6 lg:px-8 border-b border-border-color dark:border-[#302839]">
      <nav className="flex justify-between items-center py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleNav}
            className="md:hidden text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#302839]"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <div
            className="flex items-center cursor-pointer group"
            onClick={onGoHome}
            title="Trang chủ"
          >
            <Logo className="w-10 h-10 sm:w-12 sm:h-12 text-[#7f13ec]" />
            <span className="text-text-primary dark:text-white text-lg sm:text-xl font-bold tracking-tight ml-2 sm:ml-3">
              OPZEN AI
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {onOpenGallery && (
            <button
              onClick={onOpenGallery}
              className="p-2 flex items-center gap-2 rounded-lg text-sm text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#302839] hover:text-text-primary dark:hover:text-white transition-all font-semibold"
            >
              <GalleryIcon />
              <span className="hidden sm:inline">Lịch sử</span>
            </button>
          )}

          <button
            onClick={onThemeToggle}
            className="p-2 rounded-full text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#302839] hover:text-text-primary dark:hover:text-white transition-all"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
