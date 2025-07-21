import { Routes, Route } from 'react-router-dom';
import { ModalForm } from './pages/ModalForm';
import { Users } from './pages/Users';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ModalForm />} />
      <Route path="/users" element={<Users />} />
    </Routes>
  )
}

export default App
