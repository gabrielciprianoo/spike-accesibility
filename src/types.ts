export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string; // ISO 8601
};

export type SpeechSupport = {
  sttAvailable: boolean; // SpeechRecognition exists in window
  ttsAvailable: boolean; // SpeechSynthesis exists AND an es-MX voice is found
};
