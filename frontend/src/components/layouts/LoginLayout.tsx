import React from "react";
import { Button } from "../ui/button";
import { TimerReset, Clock, BadgeDollarSign } from "lucide-react";
import TimePunchDialog from "../forms/login-Dialog";
import TimePunch from "../login/timePunch";
import ClockSummary from "../login/timeSummary";
import { useAppSelector } from "@/app/hooks";
import { selectTokenById } from "@/features/auth/authSlice";
import { useTimeManagementController } from "@/hooks/useTimeManagement";

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

const SidebarButton = React.memo(
  ({ icon, label, onClick, className }: SidebarButtonProps) => (
    <Button
      className={className ?? "w-full h-20 text-xl font-semibold"}
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  )
);

const TimeManagementLayout: React.FC = () => {
  const {
    dialogContext,
    userID,
    activeComponent,
    handleLoginSuccess,
    handleButtonClick,
    closeDialog
  } = useTimeManagementController();

  const token = useAppSelector((state) => selectTokenById(state, userID));

  

  return (
    <div className="flex flex-row h-screen">
      {/* Left Sidebar */}
      <div className="flex flex-col justify-start w-1/5 p-4 space-y-4">
        <SidebarButton
          icon={<Clock className="text-lg mr-2" />}
          label="Time Punch"
          onClick={() => handleButtonClick("timePunch")}
        />
        <SidebarButton
          icon={<TimerReset className="text-lg mr-2" />}
          label="Clock Summary"
          onClick={() => handleButtonClick("timeClockSummary")}
          className="w-full h-20 text-xl font-semibold bg-blue-500 text-white"
        />
      </div>

      {/* Center Panel */}
      <div className="flex flex-1 p-4 justify-start items-start">
        <div className="w-full max-w text-center border-2 p-6">
          {activeComponent === "timePunch" && userID && token && (
            <TimePunch id={userID} token={token} />
          )}
          {activeComponent === "clockSummary" && <ClockSummary token={token} />}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col w-1/5 p-4 space-y-4">
        <SidebarButton
          icon={<BadgeDollarSign className="mr-2" />}
          label="Ring Sale"
          onClick={() => handleButtonClick("ringSale")}
          className="w-full h-full text-xl font-semibold"
        />
      </div>

      {/* Login Dialog */}
      {dialogContext && (
        <TimePunchDialog
          onLoginSuccess={handleLoginSuccess}
          onClose={closeDialog}
        />
      )}
    </div>
  );
};

export default TimeManagementLayout;
