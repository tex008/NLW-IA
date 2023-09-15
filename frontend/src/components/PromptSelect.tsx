import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function PromptSelect() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="title">Título do Youtube</SelectItem>
        <SelectItem value="description">Descrição do Youtube</SelectItem>
      </SelectContent>
    </Select>
  );
}
