import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/app/store";

interface TimePunchDialogProps {
  onClose: () => void;
  onLoginSuccess: (id: string | null, token: string | null) => void;
}

const TimePunchDialog: React.FC<TimePunchDialogProps> = ({
  onClose,
  onLoginSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [activeField, setActiveField] = useState<"userID" | "password">("userID");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeypadClick = (key: string) => {
    if (error) setError("");
    if (key === "Tab") return; // ⛔ prevent "Tab" from inserting
    if (activeField === "userID") {
      setUserID((prev) => prev + key);
    } else {
      setPassword((prev) => prev + key);
    }
  };

  const handleEnter = async () => {
    const parsedUserID = Number(userID.trim());
    const parsedPassword = Number(password.trim());

    if (isNaN(parsedUserID) || isNaN(parsedPassword)) {
      setError("User ID and Password must be numeric.");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(loginUser({ userID: parsedUserID, password: parsedPassword })).unwrap();

      if (result?.user?.id && result?.token) {
        onLoginSuccess(result.user.id, result.token);
        handleClear();
        setError("");
        onClose();
      } else {
        setError("Login succeeded but user or token was missing.");
        onLoginSuccess(null, null);
        onClose();
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(typeof err === "string" ? err : "Invalid credentials or login error.");
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

  const handleCancel = () => {
    handleClear();
    onLoginSuccess(null, null);
    onClose();
  };

  const keyStyle = "p-4 border border-gray-300 rounded-md text-lg font-semibold bg-gray-200 text-black";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50" aria-modal="true" role="dialog">
      <div className="relative bg-primary p-10 rounded-md shadow-lg w-[42rem] max-w-full min-h-[30rem]">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-3 right-4 text-white text-xl hover:text-red-300"
          aria-label="Close dialog"
        >
          ✖
        </button>

        {/* Inputs */}
        <div className="flex space-x-4 mb-4">
          <div className="flex flex-col w-1/2">
            <label htmlFor="userID" className="text-lg font-semibold mb-2 text-white">User ID</label>
            <input
              id="userID"
              type="text"
              inputMode="numeric"
              value={userID}
              onFocus={() => setActiveField("userID")}
              onChange={(e) => setUserID(e.target.value)}
              className={`p-2 border ${activeField === "userID" ? "border-blue-500" : "border-gray-300"} rounded-md h-14 `}
              placeholder="Enter User ID"
              aria-label="User ID"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label htmlFor="password" className="text-lg font-semibold mb-2 text-white">Password</label>
            <input
              id="password"
              type="password"
              inputMode="numeric"
              value={password}
              onFocus={() => setActiveField("password")}
              onChange={(e) => setPassword(e.target.value)}
              className={`p-2 border ${activeField === "password" ? "border-blue-500" : "border-gray-300"} rounded-md h-14 `}
              placeholder="Enter Password"
              aria-label="Password"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        {/* Keypad */}
        <div className="grid grid-cols-4 grid-rows-4 gap-4 mb-4 w-full max-w max-h">
          {/* Row 1 */}
          <button onClick={() => handleKeypadClick("7")} className={keyStyle}>7</button>
          <button onClick={() => handleKeypadClick("8")} className={keyStyle}>8</button>
          <button onClick={() => handleKeypadClick("9")} className={keyStyle}>9</button>
          <button onClick={handleBackspace} className={keyStyle}>⬅️</button>

          {/* Row 2 */}
          <button onClick={() => handleKeypadClick("4")} className={keyStyle}>4</button>
          <button onClick={() => handleKeypadClick("5")} className={keyStyle}>5</button>
          <button onClick={() => handleKeypadClick("6")} className={keyStyle}>6</button>
          <button onClick={() => handleKeypadClick("Tab")} className={keyStyle}>Tab</button>

          {/* Row 3 */}
          <button onClick={() => handleKeypadClick("1")} className={keyStyle}>1</button>
          <button onClick={() => handleKeypadClick("2")} className={keyStyle}>2</button>
          <button onClick={() => handleKeypadClick("3")} className={keyStyle}>3</button>
          <button
            onClick={handleEnter}
            className="row-span-2 bg-green-600 text-white font-bold rounded-md p-4 flex items-center justify-center"
            disabled={loading}
            aria-label="Enter"
          >
            {loading ? "Logging in..." : "Enter"}
          </button>

          {/* Row 4 */}
          <button
            onClick={handleClear}
            className="p-4 border border-gray-300 rounded-md text-lg font-semibold bg-red-100 text-black"
            aria-label="Clear"
          >
            Clear
          </button>
          <button onClick={() => handleKeypadClick("0")} className={keyStyle}>0</button>
          <button onClick={() => handleKeypadClick(".")} className={keyStyle}>.</button>
        </div>
      </div>
    </div>
  );
};

export default TimePunchDialog;
