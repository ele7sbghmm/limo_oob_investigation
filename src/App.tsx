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
        minHeight: "100vh",
        background: "#111",
        color: "#000"
      }}>
        <Limo />
      </main>
    </>
  )
}

export default App
