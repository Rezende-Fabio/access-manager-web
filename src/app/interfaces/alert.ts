export interface Alert {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  seconds: number;
  persistent?: boolean;
}
