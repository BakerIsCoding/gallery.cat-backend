import { CodesMap } from "@interfaces/codesInterfaces";
import codes from "../../config/codes.json";

export type Lang = "es" | "en" | "ca";

export class CodeMessageService {
  private static instance: CodeMessageService | null = null;

  private codes: CodesMap;

  private constructor(codes: CodesMap) {
    this.codes = codes;
  }

  public static getInstance(): CodeMessageService {
    if (!CodeMessageService.instance) {
      CodeMessageService.instance = new CodeMessageService(
        codes as unknown as CodesMap
      );
    }
    return CodeMessageService.instance;
  }

  public getMessage(code: number | string, lang: Lang): string {
    const key = String(code);
    const entry = this.codes[key];

    if (!entry) {
      return `Message not found for code ${key}`;
    }

    if (entry[lang]) {
      return entry[lang] as string;
    }

    const first = Object.values(entry).find(Boolean);
    if (first) {
      return first;
    }

    return `Message not available (${key})`;
  }

  public static getMessage(code: number | string, lang: Lang): string {
    return CodeMessageService.getInstance().getMessage(code, lang);
  }
}
