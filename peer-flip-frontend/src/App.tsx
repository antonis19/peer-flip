// src/App.tsx
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Navbar from './components/Navbar';
import HowItWorks from './components/HowItWorks';
import { MainLayout } from './components/MainLayout';



function App() {
  const isMobile = useMediaQuery('(max-width: 600px)');

  const theme = createTheme({
    typography: {
      fontFamily: 'monospace, monaco',
    },
  });



  return (
    <ThemeProvider theme={theme}>
      <Navbar></Navbar>
      <BrowserRouter>
          <Routes>
          <Route path="/how-it-works" element={<HowItWorks url="https://raw.githubusercontent.com/antonis19/peer-flip/main/docs/how-it-works.md"/>} />
          <Route path="/*" element={<MainLayout  />} />
          </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;