import { ServerResult } from '../types.js';
interface SearchReplace {
    search: string;
    replace: string;
}
export declare function performSearchReplace(filePath: string, block: SearchReplace): Promise<ServerResult>;
export declare function parseEditBlock(blockContent: string): Promise<{
    filePath: string;
    searchReplace: SearchReplace;
    error?: string;
}>;
export {};
