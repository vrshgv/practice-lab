import { Routes, Route } from 'react-router-dom';
import { ModalForm } from './pages/ModalForm';
import { Users } from './pages/Users';
import { Merchants } from './pages/Merchants';
import { Transactions } from './pages/Transactions';

import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ModalForm />} />
      <Route path="/users" element={<Users />} />
      <Route path="/merchants" element={<Merchants />} />
      <Route path="/merchants/:id/transactions" element={<Transactions />} />
    </Routes>
  )
}

export default App
