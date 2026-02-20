import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'student' | 'faculty'>('student');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth(); // We'll just auto-login after "registering" for the demo
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(async () => {
            try {
                // In a real app, this would call a register API
                // Here we just auto-login with the provided details
                // The useAuth 'login' normally takes an existing ID.
                // For this demo, we can just say "Registration Successful" and redirect to login, 
                // OR we can hack the login to accept a new user object if we modify useAuth.
                // But for simplicity, let's just pretend to register and then login.

                toast.success('Registration initialised!', { description: 'Please wait while we set up your profile.' });

                // This is a mock registration -> login flow
                await login(id || email, role);

                navigate(role === 'student' ? '/student/dashboard' : '/faculty/dashboard');
            } catch (error) {
                console.error(error);
                toast.error('Registration failed.');
            } finally {
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-slate-950/20 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-500/5 backdrop-blur-[2px]"></div>
                <div className="z-10 text-center p-12 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-32 h-32 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-500/30"
                    >
                        <UserPlus className="w-16 h-16 text-slate-500" />
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-6 text-foreground">Join UniCampus</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Create your account to access the university's digital ecosystem. Connect, learn, and grow.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 relative bg-background overflow-y-auto">
                <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="max-w-md w-full mx-auto mt-12 mb-12">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0">
                            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Enter your details to register.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">University Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john.doe@university.edu"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={role} onValueChange={(val: 'student' | 'faculty') => setRole(val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="faculty">Faculty</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="id">ID Number</Label>
                                        <Input
                                            id="id"
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                            placeholder={role === 'student' ? 'COMP_101' : 'FAC_01'}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all mt-4"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="px-0 justify-center border-t border-border pt-6 mt-2">
                            <p className="text-sm text-muted-foreground">
                                Already have an account? <Link to="/login/student" className="text-primary hover:underline font-medium">Log in</Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Register;
