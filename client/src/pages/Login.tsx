import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

interface LoginProps {
  onLogin: (
    username: string,
    email: string,
    firstName: string,
    token: string
  ) => void;
}

interface LoginResponse {
  user: {
    username: string;
    email: string;
    firstName: string; // Added firstName here
  };
  token: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "usernameOrEmail") {
      const formattedValue = value.toLowerCase().replace(/\s/g, "");
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post<LoginResponse>(
        `${process.env.REACT_APP_BACKEND_URL}/auth/login`,
        formData
      );

      const { username, email, firstName } = response.data.user; // Extract firstName from the response
      const { token } = response.data;

      onLogin(username, email, firstName, token); // Pass firstName as well
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="h-full py-10 flex items-center justify-center bg-background">
      <div className="bg-background p-6 rounded-md shadow-md border border-gray-400 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
          Login
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block mb-1 text-gray-300"
              htmlFor="usernameOrEmail"
            >
              Username or Email
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300" htmlFor="password">
              Password
            </label>
            <div className="eyecomp flex items-center border rounded-md overflow-hidden">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border-none text-gray-700 focus:outline-none"
                required
              />
              <div
                className="h-full px-3 flex items-center cursor-pointer bg-gray-200"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <AiFillEyeInvisible className="text-gray-500" />
                ) : (
                  <AiFillEye className="text-gray-500" />
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-300">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register here
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;
