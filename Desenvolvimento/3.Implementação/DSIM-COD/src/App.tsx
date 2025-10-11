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

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
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
