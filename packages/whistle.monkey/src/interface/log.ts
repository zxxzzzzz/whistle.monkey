export interface Log {
  type: 'error' | 'warning' | 'info' | 'success',
  message: string,
  date: number,
  tags?: string[]
}