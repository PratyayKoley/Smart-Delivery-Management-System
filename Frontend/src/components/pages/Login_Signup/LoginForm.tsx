import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginSchema } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_LINK}/api/user/login`, {
                email: values.email,
                password: values.password
            });
            const data = await response.data;
            if (!data.success) {
                setErrorMessage("Invalid username or invalid password.");
            }
            localStorage.setItem("token", data.token);
            navigate("/");
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message ||
                "An unexpected error occurred. Please try again."
            );
            console.error("Login Failed: ", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your email"
                                    {...field}
                                    className="focus:ring-2 focus:ring-blue-300 transition-all duration-300"
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                    )} />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        {...field}
                                        className="pr-10 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                    )} />

                {errorMessage && (
                    <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-md border border-red-200">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-red-700 text-sm">{errorMessage}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white"
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
            </form>
        </Form>
    )
}