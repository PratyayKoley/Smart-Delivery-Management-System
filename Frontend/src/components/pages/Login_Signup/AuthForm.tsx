import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-2">
            <Card className="w-full max-w-md bg-black text-white">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        {isLogin 
                            ? "Enter your credentials to access your account" 
                            : "Create a new account to get started"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {isLogin ? <LoginForm /> : <RegisterForm />}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-4 text-center">
                        <Button 
                            variant="ghost" 
                            className="text-gray-300 hover:text-white hover:bg-gray-800"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin 
                                ? "Need an account? Register" 
                                : "Already have an account? Login"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}