import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

// const socket = io("https://your-multiplayer-server.example.com");

export default function SeismicBattleGame() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [mass, setMass] = useState(300);
  const [stiffness, setStiffness] = useState(1);
  const [zone, setZone] = useState(3);
  const [soil, setSoil] = useState(1);
  const [players, setPlayers] = useState({});
  const waveRef = useRef(null);

  const zoneFactor = [0, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0][zone];
  const soilFactor = [1, 1.1, 1.25, 1.4][soil];
  const baseShear = Math.round(mass * zoneFactor * soilFactor / stiffness);

  useEffect(() => {
    socket.on("updatePlayers", data => setPlayers(data));
    return () => socket.off("updatePlayers");
  }, []);

  useEffect(() => {
    if (joined) {
      socket.emit("playerUpdate", { room, mass, stiffness, zone, soil, baseShear });
    }
  }, [mass, stiffness, zone, soil, baseShear, joined]);

  const joinRoom = () => {
    if (!room) return;
    socket.emit("joinRoom", room);
    setJoined(true);
  };

  if (!joined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow space-y-4">
          <h1 className="text-3xl font-bold">🌐 Seismic Arena</h1>
          <input
            className="border p-2 rounded w-full"
            placeholder="Enter Room Code"
            value={room}
            onChange={e => setRoom(e.target.value)}
          />
          <button
            onClick={joinRoom}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl w-full"
          >
            Join Battle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

      <div className="md:col-span-1 bg-white rounded-2xl shadow p-5 space-y-3">
        <h2 className="text-2xl font-bold">🏗️ Your Building</h2>

        <label>Mass: {mass}</label>
        <input type="range" min="100" max="500" value={mass} onChange={e => setMass(+e.target.value)} className="w-full" />

        <label>Stiffness: {stiffness}</label>
        <input type="range" min="0.5" max="2" step="0.1" value={stiffness} onChange={e => setStiffness(+e.target.value)} className="w-full" />

        <label>Zone: {zone}</label>
        <input type="range" min="1" max="6" value={zone} onChange={e => setZone(+e.target.value)} className="w-full" />

        <label>Soil: {['A','B','C','D'][soil]}</label>
        <input type="range" min="0" max="3" value={soil} onChange={e => setSoil(+e.target.value)} className="w-full" />

        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p>Your Base Shear</p>
          <p className="text-4xl font-bold">{baseShear} kN</p>
        </div>
      </div>

      <div className="md:col-span-1 bg-white rounded-2xl shadow p-5">
        <h2 className="text-2xl font-bold mb-3">🌊 Earthquake Wave</h2>
        <motion.div
          ref={waveRef}
          className="h-40 bg-indigo-100 rounded-xl"
          animate={{ x: [0, 20, -20, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
        <p className="text-sm text-gray-600 mt-2">Intensity increases with zone</p>
      </div>

      <div className="md:col-span-1 bg-white rounded-2xl shadow p-5">
        <h2 className="text-2xl font-bold mb-3">🏆 Leaderboard</h2>
        <div className="space-y-2">
          {Object.entries(players)
            .sort((a, b) => a[1].baseShear - b[1].baseShear)
            .map(([id, p], i) => (
              <div key={id} className="flex justify-between border rounded-xl p-2">
                <span>#{i + 1} Player {id.slice(0,4)}</span>
                <span className="font-bold">{p.baseShear}</span>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
}

/* Backend sample logic

io.on("connection", socket => {
  socket.on("joinRoom", room => socket.join(room));

  socket.on("playerUpdate", data => {
    players[socket.id] = data;
    io.to(data.room).emit("updatePlayers", players);
  });
});
*/
