import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import { getClockSummary } from "@/features/clockIn/clockSummary";
import { useAppDispatch } from "@/app/hooks";

interface ClockPunch {
  clockInTime: string | null;
  clockOutTime: string | null;
  totalHours: number;
}

interface ClockedInSummary {
  [userId: string]: {
    user: {
      userID: number;
      name: string;
    };
    clockedIn: boolean;
    clockInTime: string | null;
    clockOutTime: string | null;
    punches: ClockPunch[];
  };
}



const ClockSummary: React.FC = () => {
  const dispatch = useAppDispatch();
  const [summaryData, setSummaryData] = useState<ClockedInSummary>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchClockSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await dispatch(getClockSummary()).unwrap();
      setSummaryData(response);
    } catch (error) {
      console.error("Failed to fetch clock summary:", error);
      setErrorMessage("Failed to load employee time data.");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchClockSummary();
  }, [fetchClockSummary]);

  const totalHours = useMemo(() => {
    return Object.values(summaryData).reduce((total, entry) => {
      const clockIn = entry.clockInTime ? new Date(`1970-01-01T${entry.clockInTime}`) : null;
      const clockOut = entry.clockOutTime ? new Date(`1970-01-01T${entry.clockOutTime}`) : null;
      if (clockIn && clockOut) {
        const diff = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
        return total + Math.max(diff, 0);
      }
      return total;
    }, 0);
  }, [summaryData]);

  const employeeRows = useMemo(() => (
    Object.entries(summaryData).map(([id, { user, clockInTime, clockOutTime, punches }]) => (
      <div key={id}>
        <div className="flex justify-between pt-2 text-left text-sm">
          <div className="w-1/4">{user.name}</div>
          <div className="w-1/4">{clockInTime ?? "-"}</div>
          <div className="w-1/4">{clockOutTime ?? "-"}</div>
          <div className="w-1/4">
            {clockOutTime && clockInTime
              ? (
                  Math.max(
                    (new Date(`1970-01-01T${clockOutTime}`).getTime() -
                      new Date(`1970-01-01T${clockInTime}`).getTime()) /
                      (1000 * 60 * 60),
                    0
                  ).toFixed(2)
                )
              : "0.00"}
          </div>
        </div>

        {/* 🔽 Multiple punch breakdown */}
        {punches && punches.length > 0 && (
          <div className="pt-1 pb-2 text-xs text-left text-gray-700 pl-1">
            <div className="ml-2 border-l-2 border-gray-300 pl-3">
              <p className="font-semibold mb-1">Punch History:</p>
              {punches.map((punch, index) => (
                <div key={index} className="flex justify-between pr-8">
                  <div className="w-1/4">{`In: ${punch.clockInTime ?? "-"}`}</div>
                  <div className="w-1/4">{`Out: ${punch.clockOutTime ?? "-"}`}</div>
                  <div className="w-1/4">{`Duration: ${punch.totalHours.toFixed(2)}h`}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ))
  ), [summaryData]);

  return (
    <div className="flex flex-1 p-4 justify-start items-top">
      <div className="w-full max-w text-center border-2 p-6">
        <h2 className="text-2xl font-bold mb-6">Time Clock Review Details</h2>

        {errorMessage && (
          <div className="text-red-500 mb-4 font-medium">{errorMessage}</div>
        )}

        <div className="mb-4">
          <div className="flex justify-between pt-2 pb-2 font-semibold text-sm text-left">
            <div className="w-1/4">Employee</div>
            <div className="w-1/4">In</div>
            <div className="w-1/4">Out</div>
            <div className="w-1/4">Total Hours</div>
          </div>
          <div className="w-full border-b-2 border-gray-300 my-2"></div>

          {Object.keys(summaryData).length === 0 && !isLoading && (
            <p className="text-gray-500 text-sm mt-4">No time data found.</p>
          )}

          {employeeRows}

          <div className="mt-10 text-left text-base font-medium">
            <p>Total Hours for the Day: {totalHours.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-start mt-6">
          <Button
            className="w-1/4 p-3 bg-yellow-500 text-white rounded-md"
            onClick={fetchClockSummary}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClockSummary;
