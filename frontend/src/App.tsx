import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import View from './Components/View'
import AdminDashboard from './Components/AdminDashboard'
import './App.css'

// Home component
const Home = () => {
  return (
    <div className="home-container">
      <h1>3D Photo Gallery Application</h1>
      <div className="navigation-buttons">
        <Link to="/gallery" className="nav-button gallery-button">
          📸 View 3D Gallery
        </Link>
        <Link to="/admin" className="nav-button admin-button">
          ⚙️ Admin Dashboard
        </Link>
      </div>
      <div className="back-button-container">
        <p>Select an option above to continue</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<View />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
