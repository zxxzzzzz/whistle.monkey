export interface Log {
  type:'error'|'warning'|'info'|'success',
  name:string,
  action:'add'|'delete'|'update',
  message:string
}