import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface SaveConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  acceptedCount: number;
  totalCount: number;
  isLoading?: boolean;
}

/**
 * Modal component for confirming save action
 * Shown when not all flashcards are accepted, warning user about unsaved proposals
 */
export function SaveConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  acceptedCount,
  totalCount,
  isLoading = false,
}: SaveConfirmationModalProps) {
  const rejectedCount = totalCount - acceptedCount;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Potwierdzenie zapisu fiszek</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Zamierzasz zapisać tylko <strong>{acceptedCount}</strong> z <strong>{totalCount}</strong> wygenerowanych
                fiszek.
              </p>
              {rejectedCount > 0 && (
                <p className="text-destructive">
                  <strong>{rejectedCount}</strong> {rejectedCount === 1 ? "fiszka zostanie" : "fiszki zostaną"}{" "}
                  pominięte i nie będą zapisane.
                </p>
              )}
              <p>Czy na pewno chcesz kontynuować?</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : `Zapisz ${acceptedCount} fiszek`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
