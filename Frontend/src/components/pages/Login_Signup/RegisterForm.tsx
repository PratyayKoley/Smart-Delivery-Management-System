import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { adminRegisterSchema, partnerRegisterSchema } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type RegisterFormValues = z.infer<typeof partnerRegisterSchema> | z.infer<typeof adminRegisterSchema>

export const RegisterForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showCfrmPassword, setShowCfrmPassword] = useState<boolean>(false);
    const [showAdminCode, setShowAdminCode] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const allowedSlots = [
        { "start": "00:00", "end": "04:00" },
        { "start": "04:00", "end": "08:00" },
        { "start": "08:00", "end": "12:00" },
        { "start": "12:00", "end": "16:00" },
        { "start": "16:00", "end": "20:00" },
        { "start": "20:00", "end": "00:00" }
    ]

    const getSchemaByRole = (role: string) => {
        return role === "admin" ? adminRegisterSchema : partnerRegisterSchema;
    };

    let [ role, setRole ]= useState("partner");

    // Using the dynamic schema
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(getSchemaByRole(role!)),
        defaultValues: role === "admin"
            ? {
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "admin",
                phone: "",
                adminCode: "",
            }
            : {
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "partner",
                phone: "",
                areas: [],
                shift: {
                    slot: "",
                },
            },
    });

    let watchRole = form.watch("role");

    useEffect(()=>{
        setRole(watchRole)
    }, [watchRole])

    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_LINK}/api/user/register`, values);
            const data = await response.data;

            if (!data.success) {
                setErrorMessage("Internal Server Error");
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
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-white'>Name</FormLabel>
                        <FormControl>
                            <Input className="focus:ring-2 focus:ring-blue-300 transition-all duration-300" type='text' placeholder='Enter your name' {...field} />
                        </FormControl>
                        <FormMessage className='text-red-500 text-sm' />
                    </FormItem>
                )} />

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

                <FormField control={form.control} name='confirmPassword' render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-white'>Confirm Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input type={showCfrmPassword ? "text" : "password"} className='pr-10 focus:ring-2 focus:ring-blue-300 transition-all duration-300' placeholder='Confirm your password' {...field} />
                                <button
                                    type="button"
                                    onClick={() => setShowCfrmPassword(!showCfrmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showCfrmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </FormControl>
                        <FormMessage className='text-red-500 text-sm' />
                    </FormItem>
                )} />

                <FormField control={form.control} name='phone' render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-white'>Phone</FormLabel>
                        <FormControl>
                            <Input type='tel' placeholder='Enter your phone number' pattern="[0-9+]*" {...field} />
                        </FormControl>
                        <FormMessage className='text-red-500 text-sm' />
                    </FormItem>
                )} />

                <FormField control={form.control} name='role' render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-white'>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="partner">Delivery Partner</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage className='text-red-500 text-sm' />
                    </FormItem>
                )} />

                {watchRole === "admin" && (
                    <FormField control={form.control} name='adminCode' render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-white'>Admin Code</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input type={showAdminCode ? 'text' : 'password'} placeholder='Enter your admin registration code' {...field} />
                                    <button type='button' onClick={() => setShowAdminCode(!showAdminCode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                                        {showAdminCode ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage className='text-red-500 text-sm' />
                        </FormItem>
                    )} />
                )}

                {watchRole === "partner" && (
                    <>
                        {/* Areas Input */}
                        <FormField
                            control={form.control}
                            name="areas"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-white'>Areas</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Enter areas (comma-separated)"
                                            value={field.value?.join(", ")} // Ensure it's a comma-separated string
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value
                                                        .split(",")
                                                        .map((area) => area.trim())
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 text-sm" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="shift.slot"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Select Shift</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={(value) => field.onChange(value)}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a time slot" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allowedSlots.map((slot, index) => (
                                                    <SelectItem key={index} value={`${slot.start}-${slot.end}`}>
                                                        {slot.start} – {slot.end}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage className='text-red-500 text-sm' />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                {errorMessage && (
                    <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-md border border-red-200">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-red-700 text-sm">{errorMessage}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white"
                >
                    {isLoading ? "Registering..." : "Register"}
                </Button>
            </form>
        </Form>
    )
}
