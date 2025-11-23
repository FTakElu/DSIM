import { Route, Routes } from "react-router-dom";
import AddPatientPage from "./pages/AddPatientPage";
import CadastroUsuarioPage from "./pages/CadastroUsuarioPage";
import ConfigurarAlarmePage from "./pages/ConfigurarAlarmePage";
import DetalhesPacientePage from "./pages/DetalhesPacientePage";
import EditPatientPage from "./pages/EditPatientPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PainelListaPacientes from "./pages/PainelListaPacientes";
import PerfilUsuarioPage from "./pages/PerfilUsuarioPage";

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroUsuarioPage />} />
      <Route path="/perfil" element={<PerfilUsuarioPage />} />
      
      <Route path="/pacientes" element={<PainelListaPacientes />} />
      <Route path="/pacientes/adicionar" element={<AddPatientPage />} />
      <Route path="/pacientes/editar/:id" element={<EditPatientPage />} />
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
