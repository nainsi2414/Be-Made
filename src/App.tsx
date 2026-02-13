// import reactLogo from './assets/images/email-logo.png'
// import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material';
import { NavBar } from './components/Viewer/NavBar'
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
              height: '100dvh',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}>
              <Box sx={{ height: { xs: 'auto', md: `${NAV_HEIGHT}px` }, flexShrink: 0 }}>
                <NavBar />
              </Box>

              <Box sx={{
                display: 'flex',
                flex: 1,
                overflow: { xs: 'auto', md: 'hidden' }, // allow mobile scrolling inside
                minHeight: 0,
                padding: { xs: '8px', md: '10px' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: '8px', md: 0 }
              }}>

                {/* Left Side: 3D Viewer Area */}
                <Box sx={{
                  flex: { xs: '0 0 auto', md: 1 },
                  position: 'relative',
                  bgcolor: 'transparent',
                  margin: { xs: '0', md: '10px' },
                  borderRadius: '12px',
                  overflow: 'hidden',
                  minHeight: { xs: 'auto', md: 'auto' },
                  height: { xs: '55dvh', md: 'auto' } // Use dvh for mobile
                }}>
                  <Viewer3D />
                </Box>
                <Box
                  id="configurator-scroll"
                  className="configurator-scroll"
                  sx={{
                    // width: '400px', // Standard width for configurator sidebars
                    height: { xs: 'auto', md: '100%' },
                    flex: { xs: '1 1 auto', md: '0 0 auto' }, // Allow growing to fill rest
                    minHeight: 0,
                    // borderLeft: '1px solid #eee',
                    overflowY: 'auto',

                    backgroundColor: '#f9f9f9',
                    margin: { xs: '0', md: '5px' },
                    // padding: '5px',
                    // p: 2
                  }}>
                  <BaseSelector />
                </Box>

              </Box>


              <Box sx={{ height: { xs: 'auto', md: `${BOTTOM_HEIGHT}px` }, flexShrink: 0 }}>
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
