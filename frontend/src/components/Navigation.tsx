import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, User, Menu, X } from './icons'

const Navigation: React.FC = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const mainNavItems = [
    { path: '/recipes', label: 'Menu', description: 'レシピ・メニュー' },
    { path: '/stores', label: 'Order', description: '店舗・注文' },
    { path: '/about', label: 'About', description: 'ブランドについて' },
    { path: '/contact', label: 'Contact', description: 'お問い合わせ' },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-luxury-cream-300 shadow-luxury border-b border-luxury-cream-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="flex items-center space-x-3">
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">🏠</span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-luxury-brown-900 tracking-tight">
                  Tiramisu
                </span>
                <span className="text-xs text-luxury-brown-600 font-medium -mt-1">
                  Italian Artisan
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative px-4 py-2 transition-all duration-300 ${
                    isActive
                      ? 'text-luxury-warm-600 font-semibold'
                      : 'text-luxury-brown-800 hover:text-luxury-warm-600 font-medium'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-luxury-warm-500 transform origin-left transition-transform duration-300 ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <Link
              to="/search"
              className="p-2 rounded-full text-luxury-brown-700 hover:text-luxury-warm-600 hover:bg-luxury-cream-200 transition-all duration-300"
              title="検索"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* User Icon */}
            <button
              className="p-2 rounded-full text-luxury-brown-700 hover:text-luxury-warm-600 hover:bg-luxury-cream-200 transition-all duration-300"
              title="アカウント"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-luxury-brown-800 hover:text-luxury-warm-600 hover:bg-luxury-cream-200 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-luxury-cream-400 bg-luxury-cream-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-luxury-warm-100 text-luxury-warm-700 font-semibold'
                        : 'text-luxury-brown-800 hover:bg-luxury-cream-300 hover:text-luxury-warm-600'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-lg font-medium">{item.label}</span>
                      <span className="text-sm text-luxury-brown-600 mt-1">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                )
              })}
              
              {/* Mobile Search & User */}
              <div className="flex space-x-2 px-4 pt-4 border-t border-luxury-cream-400 mt-4">
                <Link
                  to="/search"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-luxury-cream-300 text-luxury-brown-800 hover:bg-luxury-warm-100 hover:text-luxury-warm-700 transition-all duration-300"
                >
                  <Search className="w-5 h-5 mr-2" />
                  <span>検索</span>
                </Link>
                
                <button className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-luxury-cream-300 text-luxury-brown-800 hover:bg-luxury-warm-100 hover:text-luxury-warm-700 transition-all duration-300">
                  <User className="w-5 h-5 mr-2" />
                  <span>アカウント</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation