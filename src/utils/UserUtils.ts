import envCfg from "@config/envLoader";
import EncriptionUtils from "./EncryptionUtils";

export function getUserIdFromRequest(req: any): number {
  if (!req || !req.user) {
    throw new Error("Request or user not found in request");
  }

  // Si el id ya está desencriptado, devolverlo
  if (req.user.decryptedUserId) {
    return Number(req.user.decryptedUserId);
  }

  // Si tiene el id cifrado, desencriptarlo
  if (req.user.userId) {
    try {
      const encryptionUtils = EncriptionUtils.getInstance();
      const decrypted = Number(
        encryptionUtils.jwtDecryptValue(req.user.userId)
      );
      req.user.decryptedUserId = decrypted;
      return decrypted;
    } catch (err) {
      if (envCfg("DEBUG_MODE")) {
        console.error(
          "[getUserIdFromRequest] Error al desencriptar userId:",
          err
        );
      }

      throw new Error("Something went wrong while decrypting userId");
    }
  }

  throw new Error("User ID not found in request");
}

export function getUserRoleFromRequest(req: any): number | null {
  if (!req || !req.user || typeof req.user.role === "undefined") {
    return null;
  }

  return Number(req.user.role);
}
