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
