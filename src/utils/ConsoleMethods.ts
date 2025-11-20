import { formatInTimeZone } from "date-fns-tz";

export class DateFormatter {
  public static customFormatMadridDate(
    fecha: any,
    mask: string = "yyyy-MM-dd"
  ): string {
    if (fecha) {
      return formatInTimeZone(new Date(fecha), "Europe/Madrid", mask);
    } else {
      return formatInTimeZone(new Date(), "Europe/Madrid", mask);
    }
  }
}

export class ConsolePatcher {
  private readonly originalLog: typeof console.log;
  private readonly originalWarn: typeof console.warn;
  private readonly originalError: typeof console.error;

  public constructor() {
    this.originalLog = console.log;
    this.originalWarn = console.warn;
    this.originalError = console.error;
  }

  public patch(): void {
    const self = this;

    console.log = function (...args: unknown[]): void {
      self.originalLog(
        `[${DateFormatter.customFormatMadridDate(
          new Date(),
          "yyyy-MM-dd HH:mm:ss.SSS"
        )}]`,
        ...args
      );
    };

    console.warn = function (...args: unknown[]): void {
      self.originalWarn(
        `[${DateFormatter.customFormatMadridDate(
          new Date(),
          "yyyy-MM-dd HH:mm:ss.SSS"
        )}]`,
        ...args
      );
    };

    console.error = function (...args: unknown[]): void {
      self.originalError(
        `[${DateFormatter.customFormatMadridDate(
          new Date(),
          "yyyy-MM-dd HH:mm:ss.SSS"
        )}]`,
        ...args
      );
    };
  }
}
