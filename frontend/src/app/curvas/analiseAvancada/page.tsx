// app/analiseAvancada/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Brush
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Thermometer, 
  BarChart3, 
  Download,
  Filter,
  Eye,
  Calendar,
  Loader2,
  ZoomIn,
  RotateCcw,
  Settings
} from 'lucide-react';
import { getCurvas } from '../../../lib/api'; // Ajustar caminho conforme sua estrutura

// Interface para os dados (baseada na estrutura mostrada)
interface LigaCompleta {
  liga: string;
  pontos: number;
  max: number;
  min: number;
  media: number;
  inicial: number;
  final: number;
  tempoTotal: number;
  taxaResfriamento: number;
  curva: Array<{ tempo: number; valor: number }>;
}

interface AnaliseData {
  aba: string;
  ligas: Record<string, LigaCompleta>;
}

export default function AnaliseAvancada() {
  const [data, setData] = useState<AnaliseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLigas, setSelectedLigas] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'geral' | 'comparativa' | 'detalhada'>('geral');
  const [showAllCurves, setShowAllCurves] = useState(true);
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, 50]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'png'>('csv');

  // Carregar dados da API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await getCurvas();
        setData(response);
        
        // Selecionar todas as ligas por padrão
        if (response.ligas && Object.keys(response.ligas).length > 0) {
          setSelectedLigas(Object.keys(response.ligas));
        }
      } catch (err) {
        setError('Erro ao carregar dados da análise térmica');
        console.error('Erro ao carregar curvas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Carregando análise térmica...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">❌ Erro</div>
          <p className="text-gray-600">{error || 'Dados não disponíveis'}</p>
        </div>
      </div>
    );
  }

  const todasLigas = Object.keys(data.ligas);
  const ligasVisiveis = selectedLigas.length > 0 ? selectedLigas : todasLigas;
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff8042', '#0088fe', '#00c49f'];

  // Preparar dados para gráficos comparativos (apenas ligas selecionadas)
  const prepararDadosComparativos = () => {
    return ligasVisiveis.map(liga => ({
      liga: `Liga ${liga}`,
      max: Number(data.ligas[liga].max.toFixed(2)),
      min: Number(data.ligas[liga].min.toFixed(2)),
      media: Number(data.ligas[liga].media.toFixed(2)),
      taxaResfriamento: Number(Math.abs(data.ligas[liga].taxaResfriamento).toFixed(3))
    }));
  };

  // Preparar dados das curvas para gráfico de linha (com zoom)
  const prepararDadosCurvas = () => {
    if (ligasVisiveis.length === 0) return [];
    
    const maxLength = Math.max(...ligasVisiveis.map(liga => data.ligas[liga].curva.length));
    const startIndex = Math.floor((zoomRange[0] / 100) * maxLength);
    const endIndex = Math.floor((zoomRange[1] / 100) * maxLength);
    
    return Array.from({ length: endIndex - startIndex }, (_, i) => {
      const realIndex = startIndex + i;
      const ponto: any = { tempo: realIndex };
      
      ligasVisiveis.forEach(liga => {
        if (data.ligas[liga].curva[realIndex]) {
          ponto[`Liga ${liga}`] = Number(data.ligas[liga].curva[realIndex].valor.toFixed(2));
        }
      });
      return ponto;
    });
  };

  // Função para alternar seleção de liga
  const toggleLiga = (liga: string) => {
    setSelectedLigas(prev => 
      prev.includes(liga) 
        ? prev.filter(l => l !== liga)
        : [...prev, liga]
    );
  };

  // Função para selecionar todas as ligas
  const selectAllLigas = () => {
    setSelectedLigas(todasLigas);
  };

  // Função para limpar seleção
  const clearSelection = () => {
    setSelectedLigas([]);
  };

  // Função de exportação
  const exportData = () => {
    const exportData = {
      resumo: resumoGeral(),
      ligasSelecionadas: ligasVisiveis,
      dadosComparativos: prepararDadosComparativos(),
      dadosCurvas: prepararDadosCurvas(),
      configuracoes: {
        viewMode,
        zoomRange,
        dataExportacao: new Date().toISOString()
      }
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analise_termica_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      const csvData = prepararDadosComparativos();
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analise_termica_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    // PNG export seria mais complexo, precisaria de biblioteca adicional
  };

  // Reset do zoom
  const resetZoom = () => {
    setZoomRange([0, 100]);
  };

  // Componente de Card de Estatística
  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = "blue" 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };

    return (
      <div className={`p-6 rounded-xl border-2 ${colorClasses[color as keyof typeof colorClasses]} hover:shadow-lg transition-all duration-200`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Icon className="w-5 h-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
            </div>
            <div className="text-2xl font-bold mb-1">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </div>
            <p className="text-sm opacity-75">{subtitle}</p>
          </div>
          {trend && (
            <div className="ml-2">
              {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
              {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
              {trend === 'neutral' && <Activity className="w-5 h-5 text-gray-500" />}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Dados para os cards de resumo (baseado nas ligas selecionadas)
  const resumoGeral = () => {
    const valores = ligasVisiveis.map(liga => data.ligas[liga]);
    if (valores.length === 0) return { maxTemp: 0, minTemp: 0, mediaGeral: 0, maiorResfriamento: 0, totalLigas: 0, totalPontos: 0 };
    
    const maxTemp = Math.max(...valores.map(v => v.max));
    const minTemp = Math.min(...valores.map(v => v.min));
    const mediaGeral = valores.reduce((acc, v) => acc + v.media, 0) / valores.length;
    const maiorResfriamento = Math.max(...valores.map(v => Math.abs(v.taxaResfriamento)));

    return {
      maxTemp,
      minTemp,
      mediaGeral,
      maiorResfriamento,
      totalLigas: ligasVisiveis.length,
      totalPontos: valores.reduce((acc, v) => acc + v.pontos, 0)
    };
  };

  const resumo = resumoGeral();
  const dadosComparativos = prepararDadosComparativos();
  const dadosCurvas = prepararDadosCurvas();

  // Renderização baseada no modo de visualização
  const renderContent = () => {
    switch (viewMode) {
      case 'geral':
        return renderVisaoGeral();
      case 'comparativa':
        return renderVisaoComparativa();
      case 'detalhada':
        return renderVisaoDetalhada();
      default:
        return renderVisaoGeral();
    }
  };

  const renderVisaoGeral = () => (
    <>
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Temperatura Máxima"
          value={resumo.maxTemp}
          subtitle="°C - Pico nas ligas selecionadas"
          icon={Thermometer}
          trend="up"
          color="red"
        />
        <StatCard
          title="Temperatura Mínima"
          value={resumo.minTemp}
          subtitle="°C - Menor valor"
          icon={Thermometer}
          trend="down"
          color="blue"
        />
        <StatCard
          title="Média Geral"
          value={resumo.mediaGeral}
          subtitle={`°C - ${resumo.totalLigas} ligas`}
          icon={BarChart3}
          trend="neutral"
          color="green"
        />
        <StatCard
          title="Maior Resfriamento"
          value={resumo.maiorResfriamento}
          subtitle="°C/min - Taxa máxima"
          icon={TrendingDown}
          trend="down"
          color="orange"
        />
      </div>

      {/* Gráfico Principal com Zoom */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Curvas de Resfriamento ({ligasVisiveis.length} ligas)
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetZoom}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Zoom</span>
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={dadosCurvas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="tempo" 
              label={{ value: 'Tempo (pontos)', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any, name: any) => [
                `${Number(value).toFixed(2)}°C`, 
                name
              ]}
              labelFormatter={(label) => `Ponto: ${label}`}
            />
            <Legend />
            <Brush 
              dataKey="tempo"
              height={30}
              stroke="#8884d8"
              onChange={(brushData: any) => {
                if (brushData && brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
                  const total = dadosCurvas.length;
                  const start = (brushData.startIndex / total) * 100;
                  const end = (brushData.endIndex / total) * 100;
                  setZoomRange([start, end]);
                }
              }}
            />
            {ligasVisiveis.map((liga, index) => (
              <Line
                key={liga}
                type="monotone"
                dataKey={`Liga ${liga}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                name={`Liga ${liga}`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  const renderVisaoComparativa = () => (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de Comparação de Temperaturas */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            Comparação de Temperaturas
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosComparativos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="liga" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)}°C`} />
              <Legend />
              <Bar dataKey="max" fill="#ef4444" name="Máxima" />
              <Bar dataKey="media" fill="#3b82f6" name="Média" />
              <Bar dataKey="min" fill="#10b981" name="Mínima" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Taxas de Resfriamento */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-orange-600" />
            Taxas de Resfriamento
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosComparativos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="liga" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: '°C/min', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any) => `${Number(value).toFixed(3)} °C/min`} />
              <Bar dataKey="taxaResfriamento" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );

  const renderVisaoDetalhada = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {ligasVisiveis.map((liga, index) => (
        <div key={liga} className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            Liga {liga}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div><strong>Pontos:</strong> {data.ligas[liga].pontos}</div>
            <div><strong>Temp. Inicial:</strong> {data.ligas[liga].inicial.toFixed(2)}°C</div>
            <div><strong>Temp. Final:</strong> {data.ligas[liga].final.toFixed(2)}°C</div>
            <div><strong>Taxa:</strong> {data.ligas[liga].taxaResfriamento.toFixed(3)}°C/min</div>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.ligas[liga].curva.slice(0, Math.min(100, data.ligas[liga].curva.length))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tempo" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}°C`, 'Temperatura']} />
              <Area
                type="monotone"
                dataKey="valor"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Análise Térmica Avançada</h1>
        <p className="text-gray-600">
          Analisando {resumo.totalLigas} de {todasLigas.length} ligas ({resumo.totalPontos} pontos de dados)
        </p>
      </div>

      {/* Controles Avançados */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Seleção de Modo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Eye className="w-4 h-4 inline mr-1" />
              Modo de Visualização
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="geral">Visão Geral</option>
              <option value="comparativa">Comparativa</option>
              <option value="detalhada">Detalhada por Liga</option>
            </select>
          </div>

          {/* Seleção de Ligas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Seleção de Ligas ({selectedLigas.length}/{todasLigas.length})
            </label>
            <div className="flex space-x-2">
              <button
                onClick={selectAllLigas}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm transition"
              >
                Todas
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Exportação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Download className="w-4 h-4 inline mr-1" />
              Exportar Dados
            </label>
            <div className="flex space-x-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Checkboxes das Ligas */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-3">
            {todasLigas.map(liga => (
              <label key={liga} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedLigas.includes(liga)}
                  onChange={() => toggleLiga(liga)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Liga {liga}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {selectedLigas.length > 0 ? (
        renderContent()
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-lg text-center">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma Liga Selecionada</h3>
          <p className="text-gray-500 mb-4">Selecione pelo menos uma liga para visualizar os dados.</p>
          <button
            onClick={selectAllLigas}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Selecionar Todas as Ligas
          </button>
        </div>
      )}
    </div>
  );
}