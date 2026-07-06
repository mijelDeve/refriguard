"use client";

import { useState, useCallback } from "react";
import { Settings, X, Plus, Pencil, Trash2, Check, Ban } from "lucide-react";
import type { RangoAlimento } from "@/lib/types";

interface RangoForm {
  nombre: string;
  temp_min: string;
  temp_max: string;
  humedad_min: string;
  humedad_max: string;
}

const emptyForm: RangoForm = {
  nombre: "",
  temp_min: "",
  temp_max: "",
  humedad_min: "",
  humedad_max: "",
};

export function RangeManager() {
  const [open, setOpen] = useState(false);
  const [rangos, setRangos] = useState<RangoAlimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<RangoForm>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<RangoForm>(emptyForm);

  const fetchRangos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rangos");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cargar rangos");
      }
      const data = await res.json();
      setRangos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = (r: RangoAlimento) => {
    setEditingId(r.id);
    setEditForm({
      nombre: r.nombre,
      temp_min: String(r.temp_min),
      temp_max: String(r.temp_max),
      humedad_min: String(r.humedad_min),
      humedad_max: String(r.humedad_max),
    });
  };

  const handleSave = async (id: number) => {
    const form = editForm;
    if (!form.nombre.trim()) return;

    const payload = {
      nombre: form.nombre.trim(),
      temp_min: parseFloat(form.temp_min),
      temp_max: parseFloat(form.temp_max),
      humedad_min: parseFloat(form.humedad_min),
      humedad_max: parseFloat(form.humedad_max),
    };

    if (payload.temp_min >= payload.temp_max) {
      alert("temp_min debe ser menor que temp_max");
      return;
    }
    if (payload.humedad_min >= payload.humedad_max) {
      alert("humedad_min debe ser menor que humedad_max");
      return;
    }

    try {
      const res = await fetch(`/api/rangos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }
      setEditingId(null);
      await fetchRangos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error de red");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Eliminar rango para "${nombre}"?`)) return;
    try {
      const res = await fetch(`/api/rangos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }
      await fetchRangos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error de red");
    }
  };

  const handleAdd = async () => {
    const form = newForm;
    if (!form.nombre.trim()) return;

    const payload = {
      nombre: form.nombre.trim(),
      temp_min: parseFloat(form.temp_min),
      temp_max: parseFloat(form.temp_max),
      humedad_min: parseFloat(form.humedad_min),
      humedad_max: parseFloat(form.humedad_max),
    };

    if (payload.temp_min >= payload.temp_max) {
      alert("temp_min debe ser menor que temp_max");
      return;
    }
    if (payload.humedad_min >= payload.humedad_max) {
      alert("humedad_min debe ser menor que humedad_max");
      return;
    }

    try {
      const res = await fetch("/api/rangos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear");
      }
      setAdding(false);
      setNewForm(emptyForm);
      await fetchRangos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error de red");
    }
  };

  if (!open) {
    return (
      <button
        onClick={async () => {
          setOpen(true);
          await fetchRangos();
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
      >
        <Settings className="size-4" />
        Rangos
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-3xl rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Configuración de Rangos</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading && rangos.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">Cargando rangos...</p>
          )}

          {!loading && rangos.length === 0 && !error && (
            <p className="py-8 text-center text-sm text-zinc-500">
              No hay rangos configurados. Agregá el primero.
            </p>
          )}

          {rangos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-500">
                    <th className="pb-2 pr-4 font-medium">Alimento</th>
                    <th className="pb-2 pr-4 font-medium">Temperatura</th>
                    <th className="pb-2 pr-4 font-medium">Humedad</th>
                    <th className="pb-2 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {rangos.map((r) => {
                    const editing = editingId === r.id;
                    return (
                      <tr key={r.id} className="group">
                        {editing ? (
                          <>
                            <td className="py-2.5 pr-4">
                              <input
                                type="text"
                                value={editForm.nombre}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, nombre: e.target.value })
                                }
                                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-sm text-white outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editForm.temp_min}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, temp_min: e.target.value })
                                  }
                                  className="w-20 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white outline-none focus:border-blue-500"
                                />
                                <span className="text-zinc-600">a</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editForm.temp_max}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, temp_max: e.target.value })
                                  }
                                  className="w-20 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white outline-none focus:border-blue-500"
                                />
                                <span className="text-zinc-500">°C</span>
                              </div>
                            </td>
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editForm.humedad_min}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, humedad_min: e.target.value })
                                  }
                                  className="w-20 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white outline-none focus:border-blue-500"
                                />
                                <span className="text-zinc-600">a</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editForm.humedad_max}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, humedad_max: e.target.value })
                                  }
                                  className="w-20 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white outline-none focus:border-blue-500"
                                />
                                <span className="text-zinc-500">%</span>
                              </div>
                            </td>
                            <td className="py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleSave(r.id)}
                                  className="rounded-md p-1.5 text-green-400 transition hover:bg-zinc-800"
                                >
                                  <Check className="size-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-800"
                                >
                                  <Ban className="size-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2.5 pr-4 font-medium text-white">
                              {r.nombre}
                            </td>
                            <td className="py-2.5 pr-4 tabular-nums text-zinc-400">
                              {r.temp_min}°C — {r.temp_max}°C
                            </td>
                            <td className="py-2.5 pr-4 tabular-nums text-zinc-400">
                              {r.humedad_min}% — {r.humedad_max}%
                            </td>
                            <td className="py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                                <button
                                  onClick={() => handleEdit(r)}
                                  className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-blue-400"
                                >
                                  <Pencil className="size-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(r.id, r.nombre)}
                                  className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {adding ? (
            <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30 p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Alimento</label>
                  <input
                    type="text"
                    value={newForm.nombre}
                    onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })}
                    placeholder="Ej: Lácteos"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Temp. mín — máx (°C)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={newForm.temp_min}
                      onChange={(e) => setNewForm({ ...newForm, temp_min: e.target.value })}
                      placeholder="0.0"
                      className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                    />
                    <span className="text-zinc-600">a</span>
                    <input
                      type="number"
                      step="0.1"
                      value={newForm.temp_max}
                      onChange={(e) => setNewForm({ ...newForm, temp_max: e.target.value })}
                      placeholder="5.0"
                      className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Humedad mín — máx (%)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={newForm.humedad_min}
                      onChange={(e) => setNewForm({ ...newForm, humedad_min: e.target.value })}
                      placeholder="80"
                      className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                    />
                    <span className="text-zinc-600">a</span>
                    <input
                      type="number"
                      step="0.1"
                      value={newForm.humedad_max}
                      onChange={(e) => setNewForm({ ...newForm, humedad_max: e.target.value })}
                      placeholder="95"
                      className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <button
                    onClick={handleAdd}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setAdding(false);
                      setNewForm(emptyForm);
                    }}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-300"
            >
              <Plus className="size-4" />
              Agregar rango de alimento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
