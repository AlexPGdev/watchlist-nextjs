

import { useAuth } from "@/app/hooks/useAuth";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import settings from "../../constants/settings.json";

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
}

export const LoginModal = React.memo(function LoginModal({ open, onClose }: LoginModalProps) {

    const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
    const [loginData, setLoginData] = useState({ username: "", password: "" })
    const [signupData, setSignupData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    })
    const { login, signup } = useAuth()
    const [show, setShow] = useState(false)

    const handleLogin = async () => {
        if (!loginData.username || !loginData.password) {
            alert("Please enter both username and password")
            return
        }

        try {
            await login(loginData.username, loginData.password)
            onClose()
        } catch (error) {
            alert("Login failed. Please check your credentials.")
        }
    }

    const handleSignup = async () => {
        if (!signupData.username || !signupData.password || !signupData.confirmPassword) {
            alert("Please fill in all fields")
            return
        }

        if (signupData.password !== signupData.confirmPassword) {
            alert("Passwords do not match")
            return
        }

        if (signupData.username.length < 2 || signupData.username.length > 20) {
            alert("Username must be between 2 and 20 characters")
            return
        }

        if (signupData.password.length < 8) {
            alert("Password must be at least 8 characters")
            return
        }

        try {
            await signup(signupData.username, signupData.password)
            onClose()
        } catch (error: any) {
            if (error.message === "Username already exists") {
                alert("Username already exists. Please try a different username.")
            } else {
                alert("Signup failed.")
            }
        }
    }


    return (
        <AnimatePresence>
            {(open !== null && open) && (
                <>
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    <motion.div
                        key="modal"
                        className="fixed top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    >
                        <motion.div
                            className="relative flex flex-col gap-2 rounded-2xl shadow-inner shadow-zinc-200/30 w-1/2 max-h-[80%] z-10 bg-black/60"
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.5 }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div className="flex gap-4 mb-8 border-b border-cyan-400/30 p-4">
                                <button
                                    onClick={() => setActiveTab("login")}
                                    className={`relative px-4 py-2 text-lg font-semibold uppercase tracking-wide transition-all duration-300
                                        ${activeTab === "login"
                                            ? "text-fuchsia-500 drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                                            : "text-cyan-400 hover:text-fuchsia-500 hover:drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                                        }`}
                                >
                                    Login
                                    <span
                                        className={`absolute left-0 -bottom-4 h-[2px] w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 origin-left transition-transform duration-300
                                            ${activeTab === "login" ? "scale-x-100" : "scale-x-0"}
                                        `}
                                    />
                                </button>

                                <button
                                    onClick={() => {
                                        setActiveTab("signup");
                                        setSignupData({ username: "", password: "", confirmPassword: "" });
                                    }}
                                        className={`relative px-4 py-2 text-lg font-semibold uppercase tracking-wide transition-all duration-300
                                            ${activeTab === "signup"
                                                ? "text-fuchsia-500 drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                                                : "text-cyan-400 hover:text-fuchsia-500 hover:drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                                        }`}
                                >
                                    Sign Up
                                    <span
                                        className={`absolute left-0 -bottom-4 h-[2px] w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 origin-left transition-transform duration-300
                                            ${activeTab === "signup" ? "scale-x-100" : "scale-x-0"}
                                        `}
                                    />
                                </button>
                            </div>

                            {activeTab === "login" ? (
                                <div className="transition-all duration-300 p-4">
                                    <h3 className="text-xl font-semibold mb-4">Login</h3>

                                    <div className="mb-4">
                                        <label className="block mb-1">Username</label>
                                        <input
                                            type="text"
                                            placeholder="Enter username"
                                            value={loginData.username}
                                            onChange={(e) =>
                                                setLoginData({ ...loginData, username: e.target.value })
                                            }
                                            className="w-full px-3 py-2 rounded bg-black/20 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1">Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter password"
                                            value={loginData.password}
                                            onChange={(e) =>
                                                setLoginData({ ...loginData, password: e.target.value })
                                            }
                                            className="w-full px-3 py-2 rounded bg-black/20 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleLogin}
                                            className="px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400"
                                        >
                                            Login
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="transition-all duration-300">
                                    <h3 className="text-xl font-semibold mb-4">Sign Up</h3>

                                    <div className="mb-4">
                                        <label className="block mb-1">Username</label>
                                        <input
                                            type="text"
                                            placeholder="Choose a username"
                                            value={signupData.username}
                                            onChange={(e) =>
                                                setSignupData({ ...signupData, username: e.target.value })
                                            }
                                            autoComplete="off"
                                            className="w-full px-3 py-2 rounded bg-black/20 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1">Password</label>
                                        <input
                                            type="password"
                                            placeholder="Choose a password"
                                            value={signupData.password}
                                            onChange={(e) =>
                                                setSignupData({ ...signupData, password: e.target.value })
                                            }
                                            autoComplete="new-password"
                                            className="w-full px-3 py-2 rounded bg-black/20 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            placeholder="Confirm your password"
                                            value={signupData.confirmPassword}
                                            onChange={(e) =>
                                                setSignupData({
                                                    ...signupData,
                                                    confirmPassword: e.target.value,
                                                })
                                            }
                                            autoComplete="new-password"
                                            className="w-full px-3 py-2 rounded bg-black/20 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSignup}
                                            className="px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
});