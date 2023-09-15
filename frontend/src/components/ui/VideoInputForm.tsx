import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from '@ffmpeg/util';
import { FileVideo, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { fileURLToPath } from "url";
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

  async function convertVideoToAudio(video: File) {
    console.log("Convert started...")

    // carrega o ffmpeg
    const ffmpeg = await getFFmpeg()

    // coloca um arquivo dentro do contexto do ffmpeg. Com o o web assembly, é como se o ffmpeg não estivesse rodando na máquina local, é como se ele estivesse rodando num container, num ambiente isolado... então ele não tem acesso aos arquivos na aplicação, por isso a necessidade de um write File no ffmpeg
    await ffmpeg.writeFile("input.mp4", await fetchFile(video))

    // usado para ouvir os logs e desbugar caso necessário
    // ffmpeg.on('log', (log) => {
    //   console.log(log)
    // })

    // escuta o progresso do ffmpg
    ffmpeg.on('progress', (progress) => {
      console.log('Convert progress:' + Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3'
    ])

    const data = await ffmpeg.readFile('output.mp3')

    // conversao de FileData em um FIle do JS
    const audioFileBlob = new Blob([data], {type: "audio/mpeg"})
    const audioFile = new File([audioFileBlob], "audio.mp3", {
      type: "audio/mpeg"
    })
    console.log('Convert finished')
    
    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement> ) {
    event.preventDefault();
    
    const prompt = promptInputRef.current?.value

    if (!videoFile) return

    // converter o video em audio - a lib da openai só suporta 25mb, em video não é nada mas em áudio é MUITA coisa. E ainda da pra diminuir a qualidade do audio para ter mais espaço. E também acelera o upload.
    // a conversão de video em audio ficará a cargo do navegador do usuário e não no backend. O que não acarreta em sobrecarga de processamento no back
    // o ffmpeg.wasm funciona bem só no chrome - no resto não funciona muito bem
    const audioFile = await convertVideoToAudio(videoFile)
    console.log(audioFile, prompt)
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