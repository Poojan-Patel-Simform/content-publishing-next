import { Button } from "@/components/ui/button";

interface Props {
  returnTo?: string;
}

export const GoogleAuthLink = ({ returnTo = "/account" }: Props) => {
  const href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google?returnTo=${encodeURIComponent(
    returnTo
  )}`;

  return (
    <Button
      variant="outline"
      className="w-full"
      render={<a href={href} />}
    >
      Continue with Google
    </Button>
  );
};
