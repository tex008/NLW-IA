import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Prompt = {
  id: string;
  title: string;
  template: string;
};

type PromptSelectedProps = {
  onPromptSelected: (template: string) => void;
};

export function PromptSelect(props: PromptSelectedProps) {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);

  useEffect(() => {
    api.get("/prompts").then((response) => {
      console.log(response.data);
      setPrompts(response.data);
    });
  }, []);

  function handlePromptSelected(promptId: string) {
    const findPrompt = prompts?.find((prompt) => prompt.id === promptId);

    if (!findPrompt) return;

    props.onPromptSelected(findPrompt.template);
  }

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt..." />
      </SelectTrigger>
      <SelectContent>
        {prompts?.map((prompt) => (
          <SelectItem key={prompt.id} value={prompt.id}>
            {prompt.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
