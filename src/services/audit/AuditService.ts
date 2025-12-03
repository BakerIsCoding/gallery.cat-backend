import { AuditTable, AuditType } from "@interfaces/auditInterfaces";
import gallery_audit, { AuditAttributes } from "@models/gallery_audit_model";

export class AuditService {
  private static async log(payload: {
    table: AuditTable;
    userId: number;
    oldData?: object | null;
    newData?: object | null;
    queryType: AuditType;
    date: Date;
  }): Promise<boolean> {
    try {
      const toSave: Partial<AuditAttributes> = {
        table: payload.table,
        userId: payload.userId,
        oldData: payload.oldData ?? null,
        newData: payload.newData,
        queryType: payload.queryType,
        date: payload.date,
      };

      const created = await gallery_audit.create(toSave as any);

      if (!created) {
        console.log("Failed to create audit record:", JSON.stringify(toSave));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error logging audit record:", error);
      return false;
    }
  }

  public static async logInsert(params: {
    table: AuditTable;
    userId: number;
    newData: object;
  }): Promise<boolean> {
    return this.log({
      table: params.table,
      userId: params.userId,
      newData: params.newData,
      queryType: AuditType.INSERT,
      date: new Date(),
    });
  }

  public static async logUpdate(params: {
    table: AuditTable;
    userId: number;
    oldData: object;
    newData: object;
  }): Promise<boolean> {
    return this.log({
      table: params.table,
      userId: params.userId,
      oldData: params.oldData,
      newData: params.newData,
      queryType: AuditType.UPDATE,
      date: new Date(),
    });
  }

  public static async logDelete(params: {
    table: AuditTable;
    userId: number;
    oldData: object;
  }): Promise<boolean> {
    return this.log({
      table: params.table,
      userId: params.userId,
      oldData: params.oldData,
      newData: null,
      queryType: AuditType.DELETE,
      date: new Date(),
    });
  }
}

export default AuditService;
