<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PainelListaPacientes from "./pages/PainelListaPacientes";
import AddPatientPage from "./pages/AddPatientPage";
import DetalhesPacientePage from "./pages/DetalhesPacientePage";
import LoginPage from "./pages/LoginPage";
import ConfigurarAlarmePage from "./pages/ConfigurarAlarmePage";
import CadastroUsuarioPage from "./pages/CadastroUsuarioPage";

function App() {
=======
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PatientListPage from "./pages/PainelListaPacientes";
import AddPatientPage from "./pages/AddPatientPage";
import DetalhesPacientePage from "./pages/DetalhesPacientePage";
import { Pacientes } from "./Types/PacientesType"; 

function App() {
  const [patients, setPatients] = useState<Pacientes[]>([]);

  const handleAddPatient = (newPatientData: Omit<Pacientes, "id">) => {
    setPatients((prevPatients) => [
      ...prevPatients,
      {
        id:
          prevPatients.length > 0
            ? Math.max(...prevPatients.map((p) => p.id)) + 1
            : 1,
        ...newPatientData,
      },
    ]);
  };
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
<<<<<<< HEAD
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
=======
      <Route
        path="/pacientes"
        element={<PatientListPage patients={patients} />}
      />
      <Route
        path="/pacientes/adicionar"
        element={<AddPatientPage onAddPatient={handleAddPatient} />}
      />
      <Route 
        path="/pacientes/:pacienteId"
        element={<DetalhesPacientePage patients={patients} />} 
      />
    </Routes>
    
  );
}

export default App;
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032
