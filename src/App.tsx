// import reactLogo from './assets/images/email-logo.png'
// import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material';
import {NavBar} from './components/Viewer/NavBar'
import BaseSelector from "./components/BaseSelector"
import { BottomBar } from './components/Viewer/BottomBar';
import './App.css'
import Viewer3D from './components/Viewer/Viewer3D'
// import { Checkout } from './components/Checkout';
import Checkout from './components/Checkout'
import Auth from './components/Auth'


function App() {
  const NAV_HEIGHT = 68
  const BOTTOM_HEIGHT = 66

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Box sx={{
              bgcolor: 'white',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ height: `${NAV_HEIGHT}px`, flexShrink: 0 }}>
                <NavBar />
              </Box>

              <Box sx={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden', // Prevents the whole page from scrolling
                padding: '10px',
              }}>

                {/* Left Side: 3D Viewer Area */}
                <Box sx={{ flex: 1, position: 'relative', bgcolor: 'transparent', margin: '10px', borderRadius: '12px', overflow: 'hidden' }}>
                  <Viewer3D />
                </Box>
                <Box
                  id="configurator-scroll"
                  className="configurator-scroll"
                  sx={{
                  // width: '400px', // Standard width for configurator sidebars
                  height: '100%',
                  // borderLeft: '1px solid #eee',
                  overflowY: 'auto',
                  backgroundColor: '#f9f9f9',
                  margin: '5px',
                  // padding: '5px',
                  // p: 2
                }}>
                  <BaseSelector />
                </Box>

              </Box>


              <Box sx={{ height: `${BOTTOM_HEIGHT}px`, flexShrink: 0 }}>
                <BottomBar />
              </Box>
            </Box>
          }
        />

        {/* CHECKOUT PAGE */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
