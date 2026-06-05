const roleLabels = {
  ROLE_USER: 'Student',
  ROLE_ADMIN: 'Administrator',
};

export function roleLabel(role) {
  return roleLabels[role] || 'Account member';
}
