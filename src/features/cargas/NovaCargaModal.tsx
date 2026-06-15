import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useStore } from "@/store/useStore";
import { CIDADES } from "@/data/cidades";
import type { TipoCarga } from "@/types";

const TIPOS: TipoCarga[] = [
  "Chapas de Aço",
  "Bobinas de Aço",
  "Chapas de MDF",
  "Perfis Metálicos",
  "Bobinas de Alumínio",
];

export function NovaCargaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const adicionar = useStore((s) => s.adicionarCarga);
  const [cliente, setCliente] = useState("");
  const [tipo, setTipo] = useState<TipoCarga>("Chapas de Aço");
  const [peso, setPeso] = useState("12000");
  const [origem, setOrigem] = useState(CIDADES[0].nome);
  const [destino, setDestino] = useState(CIDADES[8].nome);

  function salvar() {
    const oCidade = CIDADES.find((c) => c.nome === origem)!;
    const dCidade = CIDADES.find((c) => c.nome === destino)!;
    if (!cliente.trim() || oCidade.nome === dCidade.nome) return;
    adicionar({
      cliente: cliente.trim(),
      tipo,
      pesoKg: Math.max(500, Number(peso) || 0),
      origem: oCidade,
      destino: dCidade,
    });
    setCliente("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cadastrar nova carga"
      description="Registre uma carga para disponibilizá-la à alocação de motoristas."
    >
      <div className="space-y-4">
        <div>
          <Label>Cliente</Label>
          <Input
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ex.: Gerdau S.A."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de carga</Label>
            <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCarga)}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Peso (kg)</Label>
            <Input
              type="number"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              min={500}
              step={500}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Origem</Label>
            <Select value={origem} onChange={(e) => setOrigem(e.target.value)}>
              {CIDADES.map((c) => (
                <option key={c.nome} value={c.nome}>
                  {c.nome}/{c.uf}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Destino</Label>
            <Select value={destino} onChange={(e) => setDestino(e.target.value)}>
              {CIDADES.map((c) => (
                <option key={c.nome} value={c.nome}>
                  {c.nome}/{c.uf}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {origem === destino && (
          <p className="text-xs text-red-400">Origem e destino devem ser diferentes.</p>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={salvar} disabled={!cliente.trim() || origem === destino}>
          Cadastrar carga
        </Button>
      </div>
    </Modal>
  );
}
