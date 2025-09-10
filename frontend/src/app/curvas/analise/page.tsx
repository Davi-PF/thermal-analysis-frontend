// src/app/curvas/analise/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurvas } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalisePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getCurvas().then(setData).catch(console.error);
  }, []);

  if (!data) return <p className="p-6">Carregando análises...</p>;

  // Obter as chaves das ligas (códigos)
  const ligasKeys = Object.keys(data.ligas);
  
  // Junta os dados no formato: [{tempo, [liga1], [liga2], ...}]
  const curvasFormatadas = ligasKeys.map((liga: string) =>
    data.ligas[liga].curva.map((ponto: any) => ({
      tempo: ponto.tempo,
      [liga]: ponto.valor,
    }))
  );

  // Merge de todas as curvas pelo tempo
  const curvasCombinadas = curvasFormatadas.reduce((acc: any[], curva: any[]) => {
    curva.forEach((ponto, idx) => {
      if (!acc[idx]) acc[idx] = { tempo: ponto.tempo };
      acc[idx] = { ...acc[idx], ...ponto };
    });
    return acc;
  }, []);

  // Cores similares ao Excel
  const colors = ["#4472C4", "#E7E6E6", "#70AD47", "#FFC000", "#5B9BD5", "#A5A5A5"];
  
  // Calcular estatísticas para cada liga
  const estatisticas = ligasKeys.map(liga => {
    const ligaData = data.ligas[liga];
    return {
      liga,
      media: ligaData.media,
      max: ligaData.max,
      min: ligaData.min,
      taxaResfriamento: ligaData.taxaResfriamento,
      tempoTotal: ligaData.tempoTotal,
      inicial: ligaData.inicial,
      final: ligaData.final
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Análise Comparativa de Ligas</h1>
        <p className="text-gray-600">Curvas de Resfriamento - Análise Geral</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {estatisticas.map((stats, idx) => (
          <Card key={stats.liga} className={`border-l-4 border-l-[${colors[idx % colors.length]}]`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                ></div>
                Liga {stats.liga}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Média:</span>
                <span className="font-semibold">{stats.media.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Máx:</span>
                <span className="font-semibold">{stats.max.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mín:</span>
                <span className="font-semibold">{stats.min.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa Resfriamento:</span>
                <span className="font-semibold">{stats.taxaResfriamento.toFixed(3)}°C/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tempo Total:</span>
                <span className="font-semibold">{stats.tempoTotal}s</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Curvas de Resfriamento</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart 
              data={curvasCombinadas}
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
              {ligasKeys.map((liga: string, idx: number) => (
                <Line
                  key={liga}
                  type="monotone"
                  dataKey={liga}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2.5}
                  name={liga}
                  dot={false}
                  activeDot={{ 
                    r: 4, 
                    stroke: colors[idx % colors.length], 
                    strokeWidth: 2,
                    fill: 'white'
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Análise Comparativa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Resumo das Características</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600">Maior temperatura inicial:</span>
                  <span className="font-semibold">
                    Liga {estatisticas.reduce((max, curr) => curr.inicial > max.inicial ? curr : max).liga}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Menor temperatura final:</span>
                  <span className="font-semibold">
                    Liga {estatisticas.reduce((min, curr) => curr.final < min.final ? curr : min).liga}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Maior taxa de resfriamento:</span>
                  <span className="font-semibold">
                    Liga {estatisticas.reduce((max, curr) => Math.abs(curr.taxaResfriamento) > Math.abs(max.taxaResfriamento) ? curr : max).liga}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Mais estável (menor variação):</span>
                  <span className="font-semibold">
                    Liga {estatisticas.reduce((min, curr) => (curr.max - curr.min) < (min.max - min.min) ? curr : min).liga}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Observações</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Todas as ligas apresentam comportamento similar de resfriamento</p>
                <p>• Resfriamento mais rápido nas primeiras 30-40 segundos</p>
                <p>• Estabilização da temperatura após ~80 segundos</p>
                <p>• Diferenças sutis nas taxas de resfriamento entre as ligas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
