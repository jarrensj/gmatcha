import { Button } from "@/components/ui/button";

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
  if (!isOpen) return null;

  const actionText = pendingAction === 'generate' ? 'generating markdown' : 'navigating away';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Unsaved Changes</h3>
        <p className="text-gray-600 mb-6">
          You have unsaved changes. Save before <span className="font-semibold" style={{ color: 'var(--secondary-teal)' }}>{actionText}</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Keep Editing
          </Button>
          <Button
            onClick={onSaveAndContinue}
          >
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

