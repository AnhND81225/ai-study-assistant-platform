const roleLabels = {
  ROLE_USER: 'Student',
  ROLE_ADMIN: 'Administrator',
};

const submissionStatusLabels = {
  UPLOADED: 'Ready to solve',
  EXPLAINED: 'Solution ready',
  QUESTION_SELECTION_REQUIRED: 'Choose a question',
  INCOMPLETE_IMAGE: 'Photo incomplete',
  PARTIAL_RESULT: 'Partial solution',
  AI_FAILED: 'Needs retry',
};

export function roleLabel(role) {
  return roleLabels[role] || 'Account member';
}

export function submissionStatusLabel(status) {
  return submissionStatusLabels[status] || status;
}
