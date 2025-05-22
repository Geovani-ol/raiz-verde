import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function Donar() {
  const [amount, setAmount] = useState(250);
  const [customAmount, setCustomAmount] = useState('');
  const [estado, setEstado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const fixedAmounts = [100, 250, 500, 1000];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const estadoParam = params.get('estado');
    if (estadoParam === 'exito' || estadoParam === 'cancelado') {
      setEstado(estadoParam);
      setMostrarModal(true);
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const handleSelectAmount = (value) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = Number(val);
    setAmount(!isNaN(num) && num > 0 ? num : 0);
  };

  const handleDonate = async () => {
    if (amount <= 0) {
      alert('Ingresa un monto válido mayor a 0');
      return;
    }
    try {
      const res = await fetch('/api/crear-sesion-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: Math.round(amount * 100) }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('No se pudo crear la sesión de pago');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la donación');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 -my-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Lado izquierdo: Información */}
        <section className="bg-white border border-gray-300 p-8 rounded-lg shadow-xl flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-green-800 mb-6">
            Apoya Raíz Verde: Cultiva tu Hogar, Cultiva tu Vida
          </h1>
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">
            Raíz Verde es una plataforma educativa que ayuda a personas como tú a aprender a cultivar alimentos en casa, paso a paso, con tutoriales fáciles, videos y consejos prácticos.
          </p>

          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            ¿Con qué nos ayudas al donar?
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Crear y mantener tutoriales y cursos de cultivo orgánico en casa.</li>
            <li>Ofrecer enlaces directos a tiendas ecológicas para comprar semillas, productos frescos y herramientas de invernadero.</li>
            <li>Facilitar un foro comunitario donde compartir experiencias, dudas y consejos entre cultivadores.</li>
            <li>Mantener el desarrollo y mejoras constantes de la app para que la experiencia sea cada vez mejor.</li>
            <li>Brindar acceso gratuito o a bajo costo a personas que desean mejorar su alimentación y estilo de vida.</li>
          </ul>
        </section>

        {/* Lado derecho: Donación */}
        <section className="bg-white border border-gray-300 p-8 rounded-lg shadow-xl flex flex-col">
          <div className="mb-6 text-center">
            <Heart size={48} className="inline-block text-[#047e58] animate-pulse" />
            <h3 className="text-3xl font-bold text-green-800 mt-4">
              Dona para apoyar este proyecto
            </h3>
            <p className="text-gray-600 mt-2">
              Cada contribución hace posible que más personas aprendan a cultivar salud y vida en sus hogares.
            </p>
          </div>

          <div className="mb-4">
            <p className="font-medium mb-2 text-center">Selecciona un monto:</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {fixedAmounts.map((val) => (
                <button
                  key={val}
                  onClick={() => handleSelectAmount(val)}
                  className={`px-5 py-2 rounded border focus:outline-none text-lg ${
                    amount === val && customAmount === ''
                      ? 'bg-green-700 text-white border-green-800'
                      : 'bg-gray-200 border-gray-300 hover:bg-gray-300 hover:scale-105 transition-all'
                  }`}
                >
                  ${val} MXN
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="customAmount" className="block mb-1 font-medium text-center">
              O ingresa otro monto:
            </label>
            <input
              id="customAmount"
              type="number"
              min="1"
              value={customAmount}
              onChange={handleCustomAmount}
              placeholder="Monto en MXN"
              className="w-full border border-green-700 rounded px-3 py-2 text-center"
            />
          </div>

          <button
            onClick={handleDonate}
            className="w-full bg-green-700 text-white py-3 rounded text-lg font-semibold hover:bg-green-800 hover:scale-105 transition-all"
          >
            Donar ${amount > 0 ? amount : '0'} MXN
          </button>
        </section>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center relative">
            <div className="flex justify-center mb-4">
              <Heart size={48} className="text-purple-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-purple-700">
              {estado === 'exito'
                ? '¡Gracias por tu generosidad y apoyo!'
                : 'Donación no completada'}
            </h3>
            <p className="mb-4 text-gray-700">
              {estado === 'exito'
                ? 'Tu contribución ayuda a transformar vidas y fortalecer nuestra comunidad. Cada aporte hace posible seguir adelante con esta misión.'
                : 'Entendemos que a veces las cosas no salen como esperamos. Esperamos verte pronto apoyando esta causa tan importante.'}
            </p>
            <button
              onClick={() => setMostrarModal(false)}
              className="bg-purple-700 text-white px-5 py-2 rounded hover:bg-purple-800 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
