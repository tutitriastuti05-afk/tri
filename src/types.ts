export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface TrialResult {
  id: number;
  distance: number; // m
  time: number; // seconds
  speed: number; // m/s
  timestamp: string;
  mode: "1hp" | "2hp";
}

export interface RoomState {
  id: string;
  distance: number;
  senderClapTime: number | null;
  receiverClapTime: number | null;
  status: "idle" | "listening" | "triggered" | "completed";
  testId: number;
}
