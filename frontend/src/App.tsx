import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import RecipeSearchPage from './pages/RecipeSearchPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import StoreMapPage from './pages/StoreMapPage'
import FavoritesPage from './pages/FavoritesPage'
// import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="recipes" element={<RecipeSearchPage />} />
          <Route path="recipes/:id" element={<RecipeDetailPage />} />
          <Route path="stores" element={<StoreMapPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          {/* <Route path="admin" element={<AdminPage />} /> */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
