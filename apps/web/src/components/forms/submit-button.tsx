import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
};

export function SubmitButton({
  loading,
  loadingText = "Please wait...",
  children,
}: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full h-10" disabled={loading}>
      {loading ? loadingText : children}
    </Button>
  );
}
