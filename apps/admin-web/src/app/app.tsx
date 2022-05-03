import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import { CssBaseline } from '@mui/material';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import RecordScreen from './components/RecordScreen';

export const App = () => {
  return (
    <Router>
      <CssBaseline />
      <Header name="Mezzo" />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/record" element={<RecordScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
