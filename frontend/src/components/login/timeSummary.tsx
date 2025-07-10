import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import { getClockSummary } from "@/features/clockIn/clockSummary";
import { useAppDispatch } from "@/app/hooks";

interface EmployeeClockRecord {
  employeeName: {
    id: string;
    name: string;
    userID: number;
  };
  clockInTime: string;
  clockOutTime: string;
  totalHours: number;
}

interface ClockSummaryProps {
  token: string;
}

const ClockSummary: React.FC<ClockSummaryProps> = ({ token }) => {
  const dispatch = useAppDispatch();
  const [employeeData, setEmployeeData] = useState<EmployeeClockRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchClockSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await dispatch(getClockSummary(token)).unwrap();
      setEmployeeData(response);
    } catch (error) {
      console.error("Failed to fetch clock summary:", error);
      setErrorMessage("Failed to load employee time data.");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, token]);

  useEffect(() => {
    fetchClockSummary();
  }, [fetchClockSummary]);

  const totalHours = useMemo(() => {
    return employeeData.reduce((total, record) => total + (record.totalHours || 0), 0);
  }, [employeeData]);

  const employeeRows = useMemo(() => (
    employeeData.map((data, index) => (
      <div key={index} className="flex justify-between pt-2 text-left text-sm">
        <div className="w-1/4">{data.employeeName.name}</div>
        <div className="w-1/4">{data.clockInTime}</div>
        <div className="w-1/4">
          {data.clockOutTime === "Invalid Date" ? "-" : data.clockOutTime}
        </div>
        <div className="w-1/4">{data.totalHours.toFixed(2)}</div>
      </div>
    ))
  ), [employeeData]);

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

          {employeeData.length === 0 && !isLoading && (
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
