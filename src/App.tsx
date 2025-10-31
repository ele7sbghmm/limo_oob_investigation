import { useState } from 'react'
import './App.css'

import Limo from "./components/limo"

function App() {
  return (
    <>
      <main style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "100vw",
        minHeight: "100vh",
        background: "#100",
        color: "#111",
      }}>
        <Limo />
      </main>
    </>
  )
}

export default App
