// ============================================================
// Audit & Permission System
// Full audit log of all agent actions + role-based access control
// ============================================================

export interface AuditEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: number;
  details: string;
  status: 'approved' | 'denied' | 'pending';
  permissionLevel: 'read' | 'write' | 'admin' | 'destructive';
  toolName: string;
  duration: number;
}

export interface Role {
  id: string;
  name: string;
  permissions: ('read' | 'write' | 'admin' | 'destructive')[];
  canApprove: boolean;
  maxToolCalls: number;
}

const roles: Role[] = [
  { id: 'viewer', name: 'Viewer', permissions: ['read'], canApprove: false, maxToolCalls: 0 },
  { id: 'member', name: 'Member', permissions: ['read', 'write'], canApprove: false, maxToolCalls: 20 },
  { id: 'admin', name: 'Admin', permissions: ['read', 'write', 'admin'], canApprove: true, maxToolCalls: 100 },
  { id: 'owner', name: 'Owner', permissions: ['read', 'write', 'admin', 'destructive'], canApprove: true, maxToolCalls: 500 },
];

let auditLog: AuditEntry[] = [];
let nextAuditId = 1;
const pendingApprovals: { id: number; entry: AuditEntry; resolve: (approved: boolean) => void; reject: () => void }[] = [];

// ============================================================
// Permission Check
// ============================================================

export function hasPermission(roleId: string, requiredLevel: 'read' | 'write' | 'admin' | 'destructive'): boolean {
  const role = roles.find(r => r.id === roleId);
  if (!role) return false;
  
  const levels = ['read', 'write', 'admin', 'destructive'];
  const userMax = Math.max(...role.permissions.map(p => levels.indexOf(p)));
  const required = levels.indexOf(requiredLevel);
  return userMax >= required;
}

export function canApproveAction(roleId: string): boolean {
  const role = roles.find(r => r.id === roleId);
  return role?.canApprove ?? false;
}

export function getRoles(): Role[] {
  return roles;
}

// ============================================================
// Audit Logging
// ============================================================

export function logAction(
  user: string,
  action: string,
  resource: string,
  resourceId: number,
  details: string,
  status: AuditEntry['status'],
  permissionLevel: AuditEntry['permissionLevel'],
  toolName: string,
  duration: number
): AuditEntry {
  const entry: AuditEntry = {
    id: nextAuditId++,
    timestamp: new Date().toISOString(),
    user, action, resource, resourceId, details, status,
    permissionLevel, toolName, duration,
  };
  auditLog.push(entry);
  return entry;
}

export async function requireApproval(
  user: string,
  action: string,
  resource: string,
  resourceId: number,
  details: string,
  toolName: string
): Promise<boolean> {
  const entry = logAction(user, action, resource, resourceId, details, 'pending', 'destructive', toolName, 0);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      entry.status = 'denied';
      resolve(false);
    }, 30000); // 30 second timeout

    pendingApprovals.push({
      id: entry.id,
      entry,
      resolve: (approved: boolean) => {
        clearTimeout(timeout);
        entry.status = approved ? 'approved' : 'denied';
        resolve(approved);
      },
      reject: () => {
        clearTimeout(timeout);
        entry.status = 'denied';
        reject(new Error('Approval rejected'));
      },
    });
  });
}

export function getPendingApprovals(): typeof pendingApprovals {
  return pendingApprovals;
}

export function approveAction(id: number): boolean {
  const idx = pendingApprovals.findIndex(p => p.id === id);
  if (idx === -1) return false;
  const [item] = pendingApprovals.splice(idx, 1);
  item.resolve(true);
  return true;
}

export function denyAction(id: number): boolean {
  const idx = pendingApprovals.findIndex(p => p.id === id);
  if (idx === -1) return false;
  const [item] = pendingApprovals.splice(idx, 1);
  item.resolve(false);
  return true;
}

export function getAuditLog(limit = 50): AuditEntry[] {
  return auditLog.slice(-limit).reverse();
}

export function getAuditStats() {
  return {
    total: auditLog.length,
    approved: auditLog.filter(e => e.status === 'approved').length,
    denied: auditLog.filter(e => e.status === 'denied').length,
    pending: auditLog.filter(e => e.status === 'pending').length,
    recentActions: getAuditLog(10),
  };
}

export function clearAuditLog(): void {
  auditLog = [];
}