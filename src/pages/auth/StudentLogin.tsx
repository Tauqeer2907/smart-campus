import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

const StudentLogin = () => {
    const [username, setUsername] = useState('COMP_101');
    const [password, setPassword] = useState('password');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!username.includes('_')) {
                throw new Error("Invalid Student ID Format (e.g., DEPT_ID)");
            }
            await login(username, 'student');
            toast.success('Welcome back!');
            navigate('/student/dashboard');
            // Login hook handles redirect usually, but we ensure navigation here
            // The ProtectedRoute or RootRedirect in App.tsx will handle the actual role-based routing
        } catch (error) {
            console.error(error);
            toast.error('Login failed', { description: 'Please check your credentials.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-blue-950/20 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-[2px]"></div>
                <div className="z-10 text-center p-12 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30"
                    >
                        <GraduationCap className="w-16 h-16 text-blue-500" />
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-6 text-foreground">Student Portal</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Your academic journey in one place. Track attendance, assignments, placements, and campus events effortlessly.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 relative bg-background">
                <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Role Selection
                </Link>

                <div className="max-w-md w-full mx-auto">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0">
                            <CardTitle className="text-3xl font-bold">Student Login</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Enter your University ID to access your dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Student ID</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="e.g. COMP_101"
                                        className="h-11"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="px-0 flex-col gap-4 border-t border-border pt-6 mt-2">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account? <Link to="/register" className="text-blue-500 hover:underline font-medium">Sign up</Link>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Having trouble? <a href="#" className="text-blue-500 hover:underline">Contact IT Support</a>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
