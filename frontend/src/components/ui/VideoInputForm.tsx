import { FileVideo, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Separator } from "./separator";
import { Textarea } from "./textarea";

export default function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget

    if (!files) {
      return
    }

    const selectedFile = files[0]
    setVideoFile(selectedFile)
  }

  function handleUploadVideo(event: FormEvent<HTMLFormElement> ) {
    event.preventDefault();
    
    const prompt = promptInputRef.current?.value

    if (!videoFile) return

    // converter o video em audio - a lib da openai só suporta 25mb, em video não é nada mas em áudio é MUITA coisa. E ainda da pra diminuir a qualidade do audio para ter mais espaço. E também acelera o upload.
    // a conversão de video em audio ficará a cargo do navegador do usuário e não no backend. O que não acarreta em sobrecarga de processamento no back
    // o ffmpeg.wasm funciona bem só no chrome - no resto não funciona muito bem
  }

  const previewUrl = useMemo(() => {
    if (!videoFile) return null

    return URL.createObjectURL(videoFile)
  },[videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className='relative flex flex-col items-center justify-center gap-2 text-sm border border-dashed rounded-md cursor-pointer aspect-video text-muted-foreground hover:bg-primary/5'
      >
        {previewUrl ? (
          <video src={previewUrl} controls={false} className="absolute inset-0 pointer-events-none"/>
        ) : (
          <>
            <FileVideo className='w-4 h-4' />
            Selecione um vídeo
          </>
        )}
      </label>
      <input type="file" id="video" accept='video/mp4' className='sr-only' onChange={handleFileSelected} />

      <Separator />

      <div className='space-y-2'>
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label >
        <Textarea
          ref={promptInputRef}
          id='transcription_prompt'
          className='h-20 leading-relaxed resize-none'
          placeholder='Inclua palavras-chave mencionadoas no vídeo separadas por vírgula (,)'
        />
      </div>

      <Button className='w-full'>
        Carregar vídeo
        <Upload className='w-4 h-4 ml-2' />
      </Button>
    </form>
  )
}