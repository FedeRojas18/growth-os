import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Targets } from './pages/Targets';
import { Partners } from './pages/Partners';
import { Todos } from './pages/Todos';
import { Insights } from './pages/Insights';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="insights" element={<Insights />} />
          <Route path="targets" element={<Targets />} />
          <Route path="partners" element={<Partners />} />
          <Route path="todos" element={<Todos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
