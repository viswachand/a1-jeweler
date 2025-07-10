import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl font-medium text-muted-foreground mb-2">Page Not Found</p>
      <p className="mb-6 text-sm text-muted-foreground">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Button onClick={() => navigate("/")}>LogIn</Button>
    </div>
  );
};

export default NotFound;
