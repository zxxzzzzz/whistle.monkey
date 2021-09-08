export interface Request {
  originalReq: {
    ruleValue: string;
  };
  passThrough: () => {};
}