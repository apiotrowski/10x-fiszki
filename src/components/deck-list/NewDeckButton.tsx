import { Button } from "../ui/button";

interface NewDeckButtonProps {
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
}

export function NewDeckButton({ onClick, variant = "default" }: NewDeckButtonProps) {
  return (
    <Button variant={variant} onClick={onClick} aria-label="Create new deck" className="whitespace-nowrap">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
      Nowa talia
    </Button>
  );
}
