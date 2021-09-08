export interface Rule {
  request: {
    url: string;
    body: any;
  };
  response: {
    body: any;
  };
  filePath: string;
  disabled: boolean;
  delay?: number;
}

export interface SharedStore {
  eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
  _path: string;
  root: string;
  content: string;
  rule?: Partial<Rule>
}
