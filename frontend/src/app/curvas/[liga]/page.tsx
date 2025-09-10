// src/app/curvas/[liga]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLiga } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function LigaPage() {
  const params = useParams();
  const liga = params.liga as string;

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getLiga(liga).then(setData).catch(console.error);
  }, [liga]);

  if (!data) return <p className="p-6">Carregando dados da liga {liga}...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Curva de Resfriamento — {liga}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Média</CardTitle>
          </CardHeader>
          <CardContent>{data.media.toFixed(2)} °C</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Máx</CardTitle>
          </CardHeader>
          <CardContent>{data.max} °C</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mín</CardTitle>
          </CardHeader>
          <CardContent>{data.min} °C</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Taxa Resfriamento</CardTitle>
          </CardHeader>
          <CardContent>{data.taxaResfriamento.toFixed(3)} °C/s</CardContent>
        </Card>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data.curva}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tempo" label={{ value: "Tempo (s)", position: "insideBottomRight", offset: -5 }} />
          <YAxis label={{ value: "Temperatura (°C)", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="valor"
            stroke="#2563eb"
            name={`Liga ${liga}`}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
