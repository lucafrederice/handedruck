import { DynamicIslandProvider } from "@/components/dynamic-island";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicIslandProvider initialSize="default">
      {children}
    </DynamicIslandProvider>
  );
}
