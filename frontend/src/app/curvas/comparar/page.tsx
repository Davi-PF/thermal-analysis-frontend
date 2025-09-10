"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getCurvas, compararLigas, ComparacaoResponse } from "@/lib/api";

type ComparacaoComChart = ComparacaoResponse & {
  chartData: Array<{ tempo: number; liga1: number; liga2: number }>;
};

const COLORS = ["#4f46e5", "#f43f5e", "#10b981", "#f59e0b"]; // cores para as linhas

export default function CompararPage() {
  const [ligas, setLigas] = useState<string[]>([]);
  const [liga1, setLiga1] = useState("");
  const [liga2, setLiga2] = useState("");
  const [resultado, setResultado] = useState<ComparacaoComChart | null>(null);
  const [loading, setLoading] = useState(false);

  // Buscar lista de ligas ao carregar a página
  useEffect(() => {
    async function fetchLigas() {
      try {
        const data = await getCurvas();
        setLigas(Object.keys(data.ligas));
      } catch (err) {
        console.error(err);
      }
    }
    fetchLigas();
  }, []);

  // Disparar comparação
  async function comparar() {
    if (!liga1 || !liga2 || liga1 === liga2) return;
    setLoading(true);
    try {
      const data = await compararLigas(liga1, liga2);
      
      // O backend já fornece os dados formatados para o gráfico
      const chartData = data.dadosGrafico.tempos.map((tempo, index) => ({
        tempo,
        liga1: data.dadosGrafico.liga1[index],
        liga2: data.dadosGrafico.liga2[index],
      }));

      setResultado({ ...data, chartData });
    } catch (err) {
      console.error(err);
      setResultado(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Comparação de Ligas</h1>
        <p className="text-gray-600">Análise Detalhada de Duas Ligas</p>
      </div>

      {/* Card de seleção */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Selecionar Ligas para Comparação</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Primeira Liga</label>
            <Select value={liga1} onValueChange={setLiga1}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {ligas.map((liga) => (
                  <SelectItem key={liga} value={liga}>
                    Liga {liga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Segunda Liga</label>
            <Select value={liga2} onValueChange={setLiga2}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {ligas.map((liga) => (
                  <SelectItem key={liga} value={liga}>
                    Liga {liga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={comparar} 
            disabled={loading || !liga1 || !liga2 || liga1 === liga2} 
            className="mt-6 md:mt-0"
            size="lg"
          >
            {loading ? "Comparando..." : "Comparar Ligas"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultado && (
        <>
          {/* Cards de Estatísticas das Ligas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-[#4472C4]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#4472C4]"></div>
                  Liga {resultado.liga1.liga}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Média:</span>
                  <span className="font-semibold">{resultado.liga1.media.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Máx:</span>
                  <span className="font-semibold">{resultado.liga1.max.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mín:</span>
                  <span className="font-semibold">{resultado.liga1.min.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa Resfriamento:</span>
                  <span className="font-semibold">{resultado.liga1.taxaResfriamento.toFixed(3)}°C/s</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#E7E6E6]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#E7E6E6]"></div>
                  Liga {resultado.liga2.liga}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Média:</span>
                  <span className="font-semibold">{resultado.liga2.media.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Máx:</span>
                  <span className="font-semibold">{resultado.liga2.max.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mín:</span>
                  <span className="font-semibold">{resultado.liga2.min.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa Resfriamento:</span>
                  <span className="font-semibold">{resultado.liga2.taxaResfriamento.toFixed(3)}°C/s</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Comparação das Curvas de Resfriamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart 
                  data={resultado.chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb" 
                    strokeWidth={1}
                  />
                  <XAxis 
                    dataKey="tempo" 
                    label={{ 
                      value: "Tempo (s)", 
                      position: "insideBottom", 
                      offset: -10,
                      style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="#374151"
                    strokeWidth={1}
                  />
                  <YAxis 
                    label={{ 
                      value: "Temperatura (°C)", 
                      angle: -90, 
                      position: "insideLeft",
                      style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="#374151"
                    strokeWidth={1}
                    domain={['dataMin - 50', 'dataMax + 50']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                    formatter={(value: any, name: string) => [
                      `${Number(value).toFixed(1)}°C`, 
                      `Liga ${name}`
                    ]}
                    labelFormatter={(label) => `Tempo: ${label}s`}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="liga1" 
                    stroke="#4472C4" 
                    strokeWidth={2.5}
                    name={resultado.liga1.liga}
                    dot={false}
                    activeDot={{ 
                      r: 4, 
                      stroke: "#4472C4", 
                      strokeWidth: 2,
                      fill: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="liga2" 
                    stroke="#E7E6E6" 
                    strokeWidth={2.5}
                    name={resultado.liga2.liga}
                    dot={false}
                    activeDot={{ 
                      r: 4, 
                      stroke: "#E7E6E6", 
                      strokeWidth: 2,
                      fill: 'white'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Análise Comparativa Detalhada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo das Diferenças */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Resumo das Diferenças</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Diferença de Média</h3>
                  <div className="text-center">
                    <span className={`text-3xl font-bold ${resultado.diferencaMedia > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {resultado.diferencaMedia > 0 ? '+' : ''}{resultado.diferencaMedia.toFixed(2)}°C
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {resultado.diferencaMedia > 0 
                        ? `Liga ${resultado.liga1.liga} tem média ${Math.abs(resultado.diferencaMedia).toFixed(2)}°C maior`
                        : `Liga ${resultado.liga2.liga} tem média ${Math.abs(resultado.diferencaMedia).toFixed(2)}°C maior`
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-800">Comparação Detalhada</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="text-gray-700">Melhor média:</span>
                      <span className="font-semibold text-blue-700">Liga {resultado.comparacao.melhorMedia}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="text-gray-700">Maior pico:</span>
                      <span className="font-semibold text-orange-700">Liga {resultado.comparacao.maiorPico}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-gray-700">Menor final:</span>
                      <span className="font-semibold text-green-700">Liga {resultado.comparacao.menorFinal}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                      <span className="text-gray-700">Maior resfriamento:</span>
                      <span className="font-semibold text-purple-700">Liga {resultado.comparacao.maiorResfriamento}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Mais estável:</span>
                      <span className="font-semibold text-gray-700">Liga {resultado.comparacao.maisEstavel}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análise Técnica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Análise Técnica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Características das Ligas</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-blue-700">Liga {resultado.liga1.liga}</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Temperatura inicial: {resultado.analiseCompleta.liga1.inicial.toFixed(1)}°C</li>
                        <li>• Temperatura final: {resultado.analiseCompleta.liga1.final.toFixed(1)}°C</li>
                        <li>• Variação total: {(resultado.analiseCompleta.liga1.max - resultado.analiseCompleta.liga1.min).toFixed(1)}°C</li>
                        <li>• Pontos de medição: {resultado.analiseCompleta.liga1.pontos}</li>
                      </ul>
                    </div>
                    <div className="border-l-4 border-gray-400 pl-4">
                      <h4 className="font-semibold text-gray-700">Liga {resultado.liga2.liga}</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Temperatura inicial: {resultado.analiseCompleta.liga2.inicial.toFixed(1)}°C</li>
                        <li>• Temperatura final: {resultado.analiseCompleta.liga2.final.toFixed(1)}°C</li>
                        <li>• Variação total: {(resultado.analiseCompleta.liga2.max - resultado.analiseCompleta.liga2.min).toFixed(1)}°C</li>
                        <li>• Pontos de medição: {resultado.analiseCompleta.liga2.pontos}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Insights</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Diferença de temperatura inicial: <span className="font-semibold">
                      {Math.abs(resultado.analiseCompleta.liga1.inicial - resultado.analiseCompleta.liga2.inicial).toFixed(1)}°C
                    </span></p>
                    <p>• Diferença de temperatura final: <span className="font-semibold">
                      {Math.abs(resultado.analiseCompleta.liga1.final - resultado.analiseCompleta.liga2.final).toFixed(1)}°C
                    </span></p>
                    <p>• Diferença na taxa de resfriamento: <span className="font-semibold">
                      {Math.abs(resultado.diferencas.taxaResfriamento).toFixed(3)}°C/s
                    </span></p>
                    <p>• Ambas as ligas apresentam comportamento similar de resfriamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
