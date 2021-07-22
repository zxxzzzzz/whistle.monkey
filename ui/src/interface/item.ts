export enum ITEM_TYPE {
  file,
  folder
}

export interface FileItem {
  name:string;
  path:string;
  isEnable:boolean;
  type:ITEM_TYPE.file
}
export interface FolderItem {
  name:string;
  path:string;
  children: FileItem[] |FolderItem[]
  type:ITEM_TYPE.folder
}
export type Item = FileItem | FolderItem