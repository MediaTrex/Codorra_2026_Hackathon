import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layouts';
import Dashboard from './Pages/Dashboard';
import Livemonitoring from './Pages/Livemonitoring';
import Heatmap from './Pages/Heatmap';
import Analytics from './Pages/Analytics';
import Alerts from './Pages/Alerts';
import Reports from './Pages/reports';
import Settings from './Pages/settings';
import Login from './Pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live" element={<Livemonitoring />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;