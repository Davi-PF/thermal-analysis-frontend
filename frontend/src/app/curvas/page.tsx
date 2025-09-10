// src/app/curvas/page.tsx
import { getCurvas } from "@/lib/api";

export default async function CurvasPage() {
  const data = await getCurvas();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Ligas</h1>
      <ul className="list-disc ml-6">
        {data.ligas.map((liga) => (
          <li key={liga}>{liga}</li>
        ))}
      </ul>
    </div>
  );
}
