const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function speakText(text: string, lang: "en" | "ar" = "en", voiceId?: string): Promise<HTMLAudioElement> {
  const response = await fetch(TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ text, lang, voiceId }),
  });

  if (!response.ok) {
    throw new Error(`TTS request failed: ${response.status}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  return audio;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  const ext = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
  formData.append("audio", audioBlob, `recording.${ext}`);

  const response = await fetch(STT_URL, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`STT request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text || "";
}

export function useAudioRecorder() {
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];

  const start = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    let options: MediaRecorderOptions | undefined = undefined;
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      options = { mimeType: 'audio/webm' };
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      options = { mimeType: 'audio/mp4' };
    }

    mediaRecorder = new MediaRecorder(stream, options);
    chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.start();
  };

  const stop = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorder) {
        resolve(new Blob());
        return;
      }
      mediaRecorder.onstop = () => {
        const type = mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type });
        mediaRecorder?.stream.getTracks().forEach((t) => t.stop());
        resolve(blob);
      };
      
      try {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        } else {
          resolve(new Blob(chunks));
        }
      } catch (err) {
        resolve(new Blob(chunks));
      }
    });
  };

  return { start, stop };
}
