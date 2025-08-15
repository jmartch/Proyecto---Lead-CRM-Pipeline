import { Routes, Route } from 'react-router-dom';
import Login from '../pages/AuthForm';
import Gestor from '../pages/Gestor';
//import Dashboard from '../pages/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/gestor" element={<Gestor />} />
    </Routes>
  );
}
