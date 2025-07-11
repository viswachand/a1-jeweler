import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import { getUserClock } from "@/features/clockIn/clockSummary";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clockIn, clockOut } from "@/features/clockIn/clockIn";
import { RootState } from "@/app/store";
import { getClockSummary } from "@/features/clockIn/clockSummary";

interface EmployeeClockRecord {
  clockInTime: string;
  clockOutTime: string | null;
  totalHours: number | null;
}

interface TimePunchProps {
  id: string;
  token: string;
}

const TimePunch: React.FC<TimePunchProps> = ({ id, token }) => {
  const dispatch = useAppDispatch();
  const [employeeDate] = useState(() => new Date().toLocaleDateString());
  const [employeeLogDetails, setEmployeeLogDetails] = useState<EmployeeClockRecord[]>([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userDetails = useAppSelector((state: RootState) => {
    if (!id || !state.auth.loggedInuser[id]) return null;
    return state.auth.loggedInuser[id].user;
  });

  const fetchUserClockData = useCallback(async () => {
    try {
      setLoading(true);
      const results = await dispatch(getUserClock({ id, token })).unwrap();
      setEmployeeLogDetails(results);

      const latest = results[results.length - 1];
      const active = latest && (!latest.clockOutTime || latest.clockOutTime === "Invalid Date");
      setIsClockedIn(active);
    } catch (error) {
      console.error("Failed to fetch clock records:", error);
      setErrorMessage("Failed to load clock records.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, id, token]);

  useEffect(() => {
    if (id && token) fetchUserClockData();
  }, [id, token, fetchUserClockData]);

  const handleClock = async (action: "in" | "out") => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const thunk = action === "in" ? clockIn : clockOut;
      await dispatch(thunk({ id, token })).unwrap();
      setIsClockedIn(action === "in");
      await fetchUserClockData();
      await dispatch(getClockSummary());
    } catch (error) {
      console.error(`Clock-${action} failed:`, error);
      setErrorMessage(`Clock-${action} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const clockHistory = useMemo(() => (
    employeeLogDetails.map((log, idx) => (
      <div key={idx} className="flex justify-between pt-1 text-sm">
        <div className="w-1/4 text-left">{employeeDate}</div>
        <div className="w-1/4 text-left">{log.clockInTime}</div>
        <div className="w-1/4 text-left">
          {log.clockOutTime === "Invalid Date" ? "-" : log.clockOutTime}
        </div>
      </div>
    ))
  ), [employeeLogDetails, employeeDate]);

  if (!id || !token) {
    return (
      <div className="flex flex-1 p-4 justify-center items-center">
        <div className="text-sm text-gray-500">User not loaded yet. Please wait...</div>
      </div>
    );
  }

  return (

    <div className="flex flex-1 p-4 justify-start items-start">
      <div className="w-full max-w text-center border-2 p-6">
        <h2 className="text-2xl font-bold mb-4">Time Punch</h2>

        <div className="mb-4 text-left">
          <p>Name: {userDetails?.name || "N/A"}</p>
          <p>Date: {employeeDate}</p>
          <p>Role: {userDetails?.admin ? "Admin" : "Employee"}</p>
        </div>

        {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

        {/* Clock History */}
        <div className="mb-4">
          <div className="flex justify-between border-t-2 pt-2 font-semibold">
            <div className="w-1/4 text-left">Date</div>
            <div className="w-1/4 text-left">Time In</div>
            <div className="w-1/4 text-left">Time Out</div>
          </div>
          {clockHistory}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between space-x-4">
          <Button
            className="w-1/2 bg-green-500 text-white p-3 rounded-md"
            onClick={() => handleClock("in")}
            disabled={isClockedIn || loading}
          >
            {loading && !isClockedIn ? "Clocking In..." : "Clock In"}
          </Button>
          <Button
            className="w-1/2 bg-red-500 text-white p-3 rounded-md"
            onClick={() => handleClock("out")}
            disabled={!isClockedIn || loading}
          >
            {loading && isClockedIn ? "Clocking Out..." : "Clock Out"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimePunch;
