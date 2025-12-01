import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

interface TopNavigationProps {
  currentPath: string;
}

export function TopNavigation({ currentPath }: TopNavigationProps) {
  return (
    <Menubar className="border-none bg-transparent">
      <MenubarMenu>
        <MenubarTrigger asChild>
          <a href="/" className={`cursor-pointer ${currentPath === "/" ? "bg-accent" : ""}`}>
            Strona główna
          </a>
        </MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger asChild>
          <a
            href="/decks"
            className={`cursor-pointer ${currentPath === "/decks" || currentPath.startsWith("/decks/") ? "bg-accent" : ""}`}
          >
            Lista talii
          </a>
        </MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
}

