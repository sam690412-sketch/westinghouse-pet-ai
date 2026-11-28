/** UI permissions only; server must independently enforce every action. */
export type AdminRole = 'super_admin' | 'operations_manager' | 'marketing_editor' | 'customer_support';
export type AdminPermission = 'products.read'|'prices.write'|'dashboard.read'|'orders.read'|'orders.manage'|'payments.read'|'inventory.read'|'inventory.manage'|'tickets.manage'|'warranties.manage'|'audit.read'|'content.manage'|'users.read'|'users.manage'|'approvals.read'|'approvals.decide'|'high_risk.request'|'reservations.stats'|'reservations.read'|'reservations.manage'|'reservations.export'|'reservations.audit';
export const ROLE_LABELS: Record<AdminRole,string> = {
  super_admin:'超級管理員',operations_manager:'營運主管',marketing_editor:'行銷與內容編輯',customer_support:'客服與售後專員'
};
const all: AdminPermission[]=['products.read','prices.write','dashboard.read','orders.read','orders.manage','payments.read','inventory.read','inventory.manage','tickets.manage','warranties.manage','audit.read','content.manage','users.read','users.manage','approvals.read','approvals.decide','high_risk.request','reservations.stats','reservations.read','reservations.manage','reservations.export','reservations.audit'];
export const ADMIN_PERMISSIONS: Record<AdminRole,readonly AdminPermission[]> = {
  super_admin:all,
  operations_manager:['products.read','prices.write','dashboard.read','orders.read','orders.manage','inventory.read','inventory.manage','tickets.manage','warranties.manage','approvals.read','high_risk.request','reservations.stats','reservations.read','reservations.manage','reservations.export'],
  marketing_editor:['dashboard.read','content.manage','reservations.stats'],
  customer_support:['dashboard.read','orders.read','tickets.manage','warranties.manage','reservations.stats','reservations.read','reservations.manage']
};
export const hasAdminPermission=(role:AdminRole,permission:AdminPermission)=>ADMIN_PERMISSIONS[role]?.includes(permission) ?? false;
export const ADMIN_PAGE_PERMISSION: Record<string,AdminPermission>={
 '/admin/reservations':'reservations.stats','/admin/products':'products.read','/admin':'dashboard.read','/admin/orders':'orders.read','/admin/payments':'payments.read','/admin/inventory':'inventory.read','/admin/tickets':'tickets.manage','/admin/warranties':'warranties.manage','/admin/audit-log':'audit.read','/admin/ai-knowledge':'content.manage','/admin/approvals':'approvals.read','/admin/users':'users.read'
};
export type ApprovalAction='price_change'|'store_setting'|'stock_adjustment'|'refund'|'role_change';
export const HIGH_RISK_ACTIONS:readonly ApprovalAction[]=['price_change','store_setting','stock_adjustment','refund','role_change'];
