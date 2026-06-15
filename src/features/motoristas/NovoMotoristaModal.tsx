import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useStore } from "@/store/useStore";
import { CIDADES } from "@/data/cidades";

export function NovoMotoristaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const adicionar = useStore((s) => s.adicionarMotorista);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState(CIDADES[0].nome);

  function salvar() {
    if (!nome.trim()) return;
    const c = CIDADES.find((ci) => ci.nome === cidade)!;
    adicionar({
      nome: nome.trim(),
      telefone: telefone.trim() || "(00) 90000-0000",
      cidadeBase: c,
    });
    setNome("");
    setTelefone("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cadastrar motorista"
      description="Adicione um motorista agregado à base operacional."
    >
      <div className="space-y-4">
        <div>
          <Label>Nome completo</Label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: João Batista Santos"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Telefone</Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 90000-0000"
            />
          </div>
          <div>
            <Label>Cidade base</Label>
            <Select value={cidade} onChange={(e) => setCidade(e.target.value)}>
              {CIDADES.map((c) => (
                <option key={c.nome} value={c.nome}>
                  {c.nome}/{c.uf}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={salvar} disabled={!nome.trim()}>
          Cadastrar motorista
        </Button>
      </div>
    </Modal>
  );
}
