import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

export default function WhatsAppConnect() {
  const [status, setStatus] = useState('disconnected')
  const [qrCode, setQrCode] = useState(null)
  const [phone, setPhone] = useState(null)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL)

    // Buscar status atual
    fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/status`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(data => {
      setStatus(data.status)
      setQrCode(data.qr)
      setPhone(data.phone)
    }).catch(() => {})

    socket.on('whatsapp:status', ({ status, phone }) => {
      setStatus(status)
      if (phone) setPhone(phone)
      if (status === 'connected') setQrCode(null)
    })
    socket.on('whatsapp:qr', ({ qr }) => setQrCode(qr))

    return () => socket.disconnect()
  }, [])

  const connect = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/connect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
  }

  const disconnect = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/disconnect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(() => {
      setStatus('disconnected')
      setQrCode(null)
      setPhone(null)
    })
  }

  const statusConfig = {
    disconnected: { color: 'bg-red-100 text-red-700', label: 'Desconectado', dot: 'bg-red-500' },
    connecting:   { color: 'bg-yellow-100 text-yellow-700', label: 'Conectando...', dot: 'bg-yellow-500 animate-pulse' },
    qr_ready:     { color: 'bg-blue-100 text-blue-700', label: 'Aguardando QR Code', dot: 'bg-blue-500 animate-pulse' },
    connected:    { color: 'bg-green-100 text-green-700', label: 'Conectado', dot: 'bg-green-500' }
  }

  const cfg = statusConfig[status] || statusConfig.disconnected

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-[#1A202C] mb-8">
        WhatsApp Bot
      </h1>

      {/* Status Card */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${cfg.dot}`}></div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>

          {status === 'connected' ? (
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition"
            >
              Desconectar
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={status === 'connecting' || status === 'qr_ready'}
              className="px-4 py-2 bg-[#25D366] text-white hover:bg-[#20BF5B] rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              Conectar
            </button>
          )}
        </div>

        {/* Conectado */}
        {status === 'connected' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">&#10004;&#65039;</div>
            <p className="font-bold text-green-800">Bot Ativo!</p>
            <p className="text-green-600 text-sm">{phone}</p>
            <p className="text-green-600 text-sm mt-1">
              Respondendo clientes automaticamente com IA Claude
            </p>
          </div>
        )}

        {/* QR Code */}
        {qrCode && (
          <div className="text-center">
            <p className="text-[#718096] text-sm mb-4">
              Abra o WhatsApp no celular &rarr; Dispositivos conectados &rarr; Conectar dispositivo
            </p>
            <div className="inline-block p-4 bg-white border-2 border-[#E2E8F0] rounded-2xl">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="text-xs text-[#718096] mt-3">
              O QR Code expira em 60 segundos
            </p>
          </div>
        )}

        {/* Desconectado */}
        {status === 'disconnected' && !qrCode && (
          <div className="text-center py-8 text-[#718096]">
            <div className="text-5xl mb-3">&#128241;</div>
            <p className="font-medium">Bot desconectado</p>
            <p className="text-sm">Clique em "Conectar" para gerar o QR Code</p>
          </div>
        )}
      </div>

      {/* Como o Bot Funciona */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-bold text-[#1A202C] mb-4">Como o Bot Funciona</h2>
        <div className="space-y-3 text-sm text-[#718096]">
          {[
            'Responde automaticamente todas as mensagens recebidas',
            'Conhece o cardapio em tempo real (direto do banco de dados)',
            'Usa IA Claude para conversas naturais',
            'Envia o link da loja para fechar pedidos',
            'Todas as conversas ficam salvas no painel',
            'Ignora grupos - so responde conversas individuais'
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#25D366] mt-0.5">&#9679;</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
