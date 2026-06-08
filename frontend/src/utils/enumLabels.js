const roleLabels = {
  ROLE_USER: 'Student',
  ROLE_ADMIN: 'Administrator',
};

const submissionStatusLabels = {
  UPLOADED: 'Ready to solve',
  EXPLAINED: 'Solution ready',
  AI_FAILED: 'Needs retry',
};

export function roleLabel(role) {
  return roleLabels[role] || 'Account member';
}

export function submissionStatusLabel(status) {
  return submissionStatusLabels[status] || status;
}
