import { GuestGuard } from "@/features/auth/components/auth-guard";

interface Props {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: Props) => {
  return <GuestGuard>{children}</GuestGuard>;
};

export default AuthLayout;
