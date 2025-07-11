import { useState, useCallback } from "react";
import { useAppDispatch } from "@/app/hooks";
import { useNavigate } from "react-router-dom";
import { validateRingSaleAccess } from "@/features/auth/validateRingSaleAccess";
// import { persistor } from "@/app/store";

type DialogContext = "timePunch" | "ringSale" | null;
type LoginPurpose = "punch" | "ringSale" | null;

export const useTimeManagementController = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [dialogContext, setDialogContext] = useState<DialogContext>(null);
  const [loginPurpose, setLoginPurpose] = useState<LoginPurpose>(null);
  const [userID, setUserId] = useState<string>("");
  const [activeComponent, setActiveComponent] = useState<"timePunch" | "clockSummary">("clockSummary");

  const closeDialog = useCallback(
    (fallbackView: "clockSummary" | "timePunch" | null = null) => {
      setDialogContext(null);
      setLoginPurpose(null);

      if (fallbackView) {
        setActiveComponent(fallbackView);
      }
    },
    []
  );


  const handleLoginSuccess = useCallback(
    async (id: string | null, token: string | null) => {
      if (!id || !token) {
        console.log("Login canceled or failed — ID:", id, "Token:", token);
        setUserId("");
        closeDialog("clockSummary"); // fallback when login doesn't happen
        return;
      }

      setUserId(id);

      if (loginPurpose === "ringSale") {
        try {
          const validated = await dispatch(validateRingSaleAccess({ userID: id })).unwrap();
          if (validated) {
            navigate("/dashboard");
          } else {
            alert("You need to clock in");
          }
        } catch (err) {
          alert((err as Error)?.message || "Access denied.");
        } finally {
          closeDialog("clockSummary");
        }
      } else {
        closeDialog(); // normal punch path
      }
    },
    [dispatch, loginPurpose, navigate, closeDialog]
  );




  const handleButtonClick = useCallback((action: DialogContext | "timeClockSummary") => {
    // persistor.purge();
    switch (action) {
      case "timePunch":
        setUserId("");
        setLoginPurpose("punch");
        setDialogContext("timePunch");
        setActiveComponent("timePunch");
        break;
      case "timeClockSummary":
        closeDialog();
        setActiveComponent("clockSummary");
        break;
      case "ringSale":
        setUserId("");
        setLoginPurpose("ringSale");
        setDialogContext("ringSale");
        break;
    }
  }, [closeDialog]);

  return {
    dialogContext,
    loginPurpose,
    userID,
    activeComponent,
    handleLoginSuccess,
    handleButtonClick,
    closeDialog
  };
};
