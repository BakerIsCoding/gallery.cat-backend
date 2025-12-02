import { Lang } from "@utils/CodeMethods";

export type CodeEntry = {
  [L in Lang]?: string;
};

export type CodesMap = {
  [code: string]: CodeEntry;
};
