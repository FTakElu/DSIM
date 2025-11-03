import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PainelListaPacientes from "./pages/PainelListaPacientes";
import AddPatientPage from "./pages/AddPatientPage";
import DetalhesPacientePage from "./pages/DetalhesPacientePage";
import LoginPage from "./pages/LoginPage";
import ConfigurarAlarmePage from "./pages/ConfigurarAlarmePage";
import CadastroUsuarioPage from "./pages/CadastroUsuarioPage";

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroUsuarioPage />} />
      
      <Route path="/pacientes" element={<PainelListaPacientes />} />
      <Route path="/pacientes/adicionar" element={<AddPatientPage />} />
      <Route 
        path="/pacientes/:pacienteId" 
        element={<DetalhesPacientePage />} 
      /> 
      <Route 
        path="/pacientes/:pacienteId/configurar-alarme" 
        element={<ConfigurarAlarmePage />} 
      />
    </Routes>
  );
}

export default App;
