import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Dummy socket (multiplayer baad me add karenge)
const socket = { on: () => {}, emit: () => {} };

export default function SeismicBattleGame() {

  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const [mass, setMass] = useState(300);
  const [stiffness, setStiffness] = useState(1);
  const [zone, setZone] = useState(3);
  const [soil, setSoil] = useState(1);

  const [players, setPlayers] = useState({});

  const waveRef = useRef(null);

  // Simple seismic factors
  const zoneFactor = [0, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0][zone];
  const soilFactor = [1, 1.1, 1.25, 1.4][soil];

  const baseShear = Math.round(
    (mass * zoneFactor * soilFactor) / stiffness
  );

  useEffect(() => {
    socket.on("updatePlayers", data => setPlayers(data));
  }, []);

  const joinRoom = () => {
    if (!room) return;
    setJoined(true);
  };

  // ---------------- ROOM SCREEN ----------------

  if (!joined) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6"
      }}>
        <div style={{
          background: "white",
          padding: 30,
          borderRadius: 20,
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
          width: 300,
          textAlign: "center"
        }}>
          <h1>🌐 Seismic Arena</h1>

          <input
            placeholder="Enter Room Code"
            value={room}
            onChange={e => setRoom(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 10,
              borderRadius: 10,
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={joinRoom}
            style={{
              marginTop: 15,
              width: "100%",
              padding: 10,
              borderRadius: 12,
              background: "#4f46e5",
              color: "white",
              border: "none",
              cursor: "pointer"
            }}
          >
            Join Battle
          </button>
        </div>
      </div>
    );
  }

  // ---------------- MAIN GAME ----------------

  return (
    <div style={{
      padding: 30,
      maxWidth: 1200,
      margin: "auto",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 20
    }}>

      {/* BUILDING CONTROL */}

      <div style={cardStyle}>
        <h2>🏗️ Your Building</h2>

        <p>Mass: {mass} kN</p>
        <input type="range" min="100" max="500"
          value={mass}
          onChange={e => setMass(+e.target.value)}
        />

        <p>Stiffness: {stiffness}</p>
        <input type="range" min="0.5" max="2" step="0.1"
          value={stiffness}
          onChange={e => setStiffness(+e.target.value)}
        />

        <p>Zone: {zone}</p>
        <input type="range" min="1" max="6"
          value={zone}
          onChange={e => setZone(+e.target.value)}
        />

        <p>Soil: {["A","B","C","D"][soil]}</p>
        <input type="range" min="0" max="3"
          value={soil}
          onChange={e => setSoil(+e.target.value)}
        />

        <div style={{
          background: "#f3f4f6",
          padding: 15,
          borderRadius: 15,
          marginTop: 15,
          textAlign: "center"
        }}>
          <p>Base Shear</p>
          <h1>{baseShear} kN</h1>
        </div>
      </div>

      {/* EARTHQUAKE WAVE */}

      <div style={cardStyle}>
        <h2>🌊 Earthquake Motion</h2>

        <motion.div
          ref={waveRef}
          style={{
            height: 160,
            background: "#c7d2fe",
            borderRadius: 20
          }}
          animate={{ x: [0, 25, -25, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />

        <p style={{ fontSize: 12, color: "#555", marginTop: 10 }}>
          Higher zone = stronger shaking
        </p>
      </div>

      {/* LEADERBOARD (LOCAL DEMO) */}

      <div style={cardStyle}>
        <h2>🏆 Leaderboard (Demo)</h2>

        <div style={{
          padding: 10,
          border: "1px dashed #ccc",
          borderRadius: 12
        }}>
          <p>You</p>
          <b>{baseShear} kN</b>
        </div>

        <p style={{fontSize:12, color:"#666", marginTop:10}}>
          Multiplayer will show real players here
        </p>
      </div>

    </div>
  );
}


// ---------------- STYLES ----------------

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 20,
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
};
