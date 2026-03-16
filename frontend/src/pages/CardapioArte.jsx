import { useState, useEffect, useRef } from 'react';
import { Palette, Plus, Trash2, Download, Loader2, ClipboardPaste, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function CardapioArte() {
  const [itens, setItens] = useState([]);
  const [pasteText, setPasteText] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const lastInputRef = useRef(null);

  useEffect(() => {
    carregarCardapio();
  }, []);

  async function carregarCardapio() {
    try {
      const res = await api.get('/admin/cardapio/dados');
      setItens(res.data.itens || []);
      if (res.data.updatedAt) setLastUpdate(new Date(res.data.updatedAt));
    } catch {
      // ignora erro silencioso no load
    }
  }

  function importarLista() {
    if (!pasteText.trim()) return;

    const novosItens = pasteText.split('\n')
      .map(linha =>
        linha
          .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
          .replace(/^[\s\-*.\d)]+/, '')
          .trim()
      )
      .filter(l => l.length > 0);

    if (novosItens.length === 0) {
      toast.error('Nenhum item encontrado no texto');
      return;
    }

    setItens(novosItens);
    setPasteText('');
    toast.success(`${novosItens.length} itens importados!`);
  }

  function atualizarItem(index, valor) {
    const novos = [...itens];
    novos[index] = valor;
    setItens(novos);
  }

  function removerItem(index) {
    setItens(itens.filter((_, i) => i !== index));
  }

  function adicionarItem() {
    setItens([...itens, '']);
    setTimeout(() => lastInputRef.current?.focus(), 50);
  }

  async function gerarArte() {
    const itensFiltrados = itens.filter(i => i.trim() !== '');
    if (itensFiltrados.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/admin/cardapio/gerar', { itens: itensFiltrados }, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(res.data);
      setPreviewUrl(url);
      setLastUpdate(new Date());
      toast.success('Arte gerada com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar arte');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="-m-6 -mt-6 min-h-screen bg-[#0f0f0f] p-6">
      <div className="max-w-[1100px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Gerador de Arte</h1>
            <p className="text-sm text-gray-500 mt-1">Crie a arte do cardapio do dia para redes sociais</p>
          </div>
          <span className="bg-[#D9261C] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
            Hoje
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Column */}
          <div className="space-y-4">
            {/* Paste Area */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardPaste className="w-5 h-5 text-[#D9261C]" />
                <h2 className="font-semibold text-white text-sm">Colar lista completa</h2>
              </div>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={"Cole sua lista aqui, um item por linha...\n\nEx:\nArroz ou galinhada\nFeijao\nBife acebolado"}
                className="w-full min-h-[120px] bg-[#222] border-2 border-dashed border-[#333] rounded-xl text-sm text-gray-200 p-4 outline-none focus:border-[#D9261C] transition-all resize-y placeholder:text-[#555]"
              />
              <button
                onClick={importarLista}
                className="mt-3 w-full py-2.5 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] hover:border-[#D9261C] text-gray-300 hover:text-white text-sm font-semibold rounded-xl transition-all"
              >
                Importar lista
              </button>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <span className="text-[11px] text-[#555] uppercase tracking-widest">ou edite individualmente</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
            </div>

            {/* Items List */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-[#D9261C]" />
                <h2 className="font-semibold text-white text-sm">Itens do Cardapio</h2>
                <span className="bg-[#D9261C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full ml-auto">
                  {itens.filter(i => i.trim()).length} itens
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {itens.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#222] border border-[#333] rounded-xl px-3 py-1 hover:border-[#D9261C]/50 transition-colors group">
                    <span className="text-[#555] text-xs font-mono w-5 text-center">{i + 1}</span>
                    <input
                      ref={i === itens.length - 1 ? lastInputRef : null}
                      type="text"
                      value={item}
                      onChange={e => atualizarItem(i, e.target.value)}
                      placeholder="Nome do item..."
                      className="flex-1 bg-transparent text-sm text-gray-200 py-2.5 outline-none placeholder:text-[#555]"
                    />
                    <button
                      onClick={() => removerItem(i)}
                      className="p-1.5 rounded-lg text-[#444] hover:text-[#D9261C] hover:bg-[#D9261C]/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={adicionarItem}
                className="w-full py-3 border-2 border-dashed border-[#333] hover:border-[#D9261C] text-[#666] hover:text-[#D9261C] text-sm font-semibold rounded-xl transition-all"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Adicionar item
              </button>
            </div>

            {/* Generate Button */}
            <button
              onClick={gerarArte}
              disabled={loading}
              className="w-full py-4 bg-[#D9261C] hover:bg-[#b81f17] text-white text-base font-bold rounded-xl transition-all shadow-lg shadow-[#D9261C]/20 hover:shadow-[#D9261C]/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Palette className="w-5 h-5" />
                  Gerar Arte
                </>
              )}
            </button>

            {lastUpdate && (
              <p className="text-xs text-[#555] text-center">
                Ultima atualizacao: {lastUpdate.toLocaleDateString('pt-BR')} as {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Preview Column */}
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-5 h-5 text-[#D9261C]" />
                <h2 className="font-semibold text-white text-sm">Preview da Arte</h2>
              </div>

              <div className="bg-[#111] border border-[#2a2a2a] rounded-xl min-h-[400px] flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview do cardapio" className="w-full h-auto rounded-xl" />
                ) : (
                  <div className="text-center text-[#444] py-16">
                    <Palette className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Edite o cardapio ao lado e clique em "Gerar Arte"</p>
                  </div>
                )}
              </div>

              {previewUrl && (
                <a
                  href={previewUrl}
                  download="cardapio_hoje.png"
                  className="mt-4 w-full py-3.5 bg-[#222] hover:bg-[#2a2a2a] border border-[#333] hover:border-[#D9261C] text-gray-300 hover:text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar PNG
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
