import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/app/store";


interface TimePunchDialogProps {
  onClose: () => void;
  onLoginSuccess: (id: string, token: string) => void; 
}

const TimePunchDialog: React.FC<TimePunchDialogProps> = ({ onClose, onLoginSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [activeField, setActiveField] = useState<"userID" | "password">("userID");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const KEYPAD_KEYS = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 0], []);

  const handleKeypadClick = (num: string) => {
    if (error) setError("");
    if (activeField === "userID") {
      setUserID((prev) => prev + num);
    } else {
      setPassword((prev) => prev + num);
    }
  };

  const handleEnter = async () => {
    const parsedUserID = Number(userID.trim());
    const parsedPassword = Number(password.trim());

    if (isNaN(parsedUserID) || isNaN(parsedPassword)) {
      setError("User ID and Password must be numbers.");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        loginUser({ userID: parsedUserID, password: parsedPassword })
      ).unwrap();
    
      onLoginSuccess(result.user.id, result.token);
      setError("");
      handleClear();
      onClose();
    } catch (error) {
      setError(typeof error === "string" ? error : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackspace = () => {
    if (activeField === "userID") {
      setUserID((prev) => prev.slice(0, -1));
    } else {
      setPassword((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setUserID("");
    setPassword("");
    setError("");
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-primary p-6 rounded-md shadow-lg w-128 max-w-full">
        {/* Inputs */}
        <div className="flex space-x-4 mb-4">
          <div className="flex flex-col w-1/2">
            <label
              htmlFor="userID"
              className="text-sm font-semibold mb-2 text-white"
            >
              User ID
            </label>
            <input
              id="userID"
              type="text"
              inputMode="numeric"
              value={userID}
              onFocus={() => setActiveField("userID")}
              onChange={(e) => setUserID(e.target.value)}
              className={`p-2 border ${
                activeField === "userID" ? "border-blue-500" : "border-gray-300"
              } rounded-md`}
              placeholder="Enter User ID"
              aria-label="User ID"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label
              htmlFor="password"
              className="text-sm font-semibold mb-2 text-white"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              inputMode="numeric"
              value={password}
              onFocus={() => setActiveField("password")}
              onChange={(e) => setPassword(e.target.value)}
              className={`p-2 border ${
                activeField === "password"
                  ? "border-blue-500"
                  : "border-gray-300"
              } rounded-md`}
              placeholder="Enter Password"
              aria-label="Password"
            />
          </div>
        </div>

        {/* Error */}
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {KEYPAD_KEYS.map((num) => (
            <button
              key={num}
              onClick={() => handleKeypadClick(num.toString())}
              className="p-4 border border-gray-300 rounded-md text-lg font-semibold bg-gray-200 text-black"
              disabled={loading}
              aria-label={`Key ${num}`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="p-4 border border-gray-300 rounded-md text-lg font-semibold bg-gray-200 text-black"
            disabled={loading}
            aria-label="Backspace"
          >
            ⬅️
          </button>
          <button
            onClick={handleClear}
            className="p-4 border border-gray-300 rounded-md text-lg font-semibold bg-gray-200 text-black"
            disabled={loading}
            aria-label="Clear"
          >
            Clear
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between space-x-2">
          <button
            onClick={handleEnter}
            className="w-full p-3 bg-blue-500 text-white rounded-md"
            disabled={loading}
            aria-label="Submit login"
          >
            {loading ? "Logging in..." : "Enter"}
          </button>
          <button
            onClick={onClose}
            className="w-full p-3 bg-gray-300 text-gray-700 rounded-md"
            aria-label="Cancel login"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePunchDialog;
