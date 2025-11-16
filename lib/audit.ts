import { prisma } from './prisma';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
type EntityType = 'DAILY_INFO' | 'DUTY_ROSTER' | 'USER' | 'BONFIRE';

export async function createAuditLog(
  userId: string,
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  changes?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes: changes || null,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}
