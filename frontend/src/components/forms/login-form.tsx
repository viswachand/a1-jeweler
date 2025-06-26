import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { loginUser } from "@/features/auth/authSlice";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [userID, setUserID] = useState<number | "">("");
  const [password, setPassword] = useState<number | "">("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentUser, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsedUserID = typeof userID === "number" ? userID : Number(userID);
    const parsedPassword =
      typeof password === "number" ? password : Number(password);

    if (isNaN(parsedUserID) || isNaN(parsedPassword)) {
      // dispatch could also handle this error if desired
      return;
    }

    dispatch(loginUser({ userID: parsedUserID, password: parsedPassword }));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Login</CardTitle>
          <CardDescription>
            Enter your User ID and password to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="userID">User ID</Label>
                <Input
                  id="userID"
                  placeholder="Enter your User ID"
                  required
                  value={userID}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUserID(value === "" ? "" : Number(value));
                  }}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your Password"
                  required
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value === "" ? "" : Number(value));
                  }}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
