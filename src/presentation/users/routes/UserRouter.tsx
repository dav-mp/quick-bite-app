import { Routes, Route } from "react-router-dom";
// Importa las páginas/containers que tendrá el usuario externo
// ... etc

const ExternalRoutes = () => {
  return (
    <Routes>
      <Route path="/ola" element={<h1>OLAAAAAAA</h1>} />
      {/* Puedes seguir agregando rutas específicas para usuario externo */}
    </Routes>
  );
};

export default ExternalRoutes;
