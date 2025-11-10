"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const page = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard"); 
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Login successful!");
        router.replace("/dashboard");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className=" min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-500 via-slate-400 to-slate-500">
      <div className=" w-[90%] max-w-[500px] bg-blue-300 rounded-lg p-4 flex flex-col gap-4 items-center justify-center text-black ">
        <span className=" text-3xl font-semibold ">login</span>
        <form
          onSubmit={handleSubmit}
          className=" w-full space-y-4 mx-4 mt-4 mb-2"
        >
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
          <label>Password</label>
          <div className=" w-full flex gap-0">
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
            {showPass ? (
              <Eye
                size={45}
                className=" py-0.5 px-1.5 border border-l-0 rounded-r-md cursor-pointer text-gray-700 bg-white"
                onClick={() => setShowPass(!showPass)}
              />
            ) : (
              <EyeOff
                size={45}
                className=" py-0.5 px-1.5 border border-l-0 rounded-r-md  cursor-pointer text-gray-700 bg-white"
                onClick={() => setShowPass(!showPass)}
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-xl hover:bg-blue-500 transition text-xl font-medium cursor-pointer"
          >
            Login
          </button>
        </form>
        <span className=" w-full text-center">
          Don't have an account?{" "}
          <Link href="/register" className=" text-blue-700 font-semibold">
            Sign Up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default page;
