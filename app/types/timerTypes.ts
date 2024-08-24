export type WorkerMessage = {
  type: 'START' | 'PAUSE' | 'RESET' | 'TICK' | 'SET_TIME'
  payload?: number
}
