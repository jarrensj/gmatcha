import { ConfirmationModal } from "./ConfirmationModal";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  pendingAction: 'generate' | 'navigate-settings' | null;
  onCancel: () => void;
  onSaveAndContinue: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  pendingAction,
  onCancel,
  onSaveAndContinue
}: UnsavedChangesModalProps) {
  const actionText = pendingAction === 'generate' ? 'generating markdown' : 'navigating away';

  return (
    <ConfirmationModal
      isOpen={isOpen}
      title="Unsaved Changes"
      description={
        <p>
          You have unsaved changes. Save before <span className="font-semibold" style={{ color: 'var(--secondary-teal)' }}>{actionText}</span>?
        </p>
      }
      cancelText="Keep Editing"
      confirmText="Save & Continue"
      onCancel={onCancel}
      onConfirm={onSaveAndContinue}
    />
  );
}

