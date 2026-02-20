import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

const StudentLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState<'pending' | 'rejected' | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setApprovalStatus(null);
        setRejectionReason('');

        try {
            if (!identifier.trim()) {
                throw new Error("Please enter your Roll Number or Email");
            }

            // Make API call to login
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                identifier: identifier.trim(),
                role: 'student'
            });

            const { user, token } = response.data;

            // Check approval status
            if (user.status === 'pending_approval') {
                setApprovalStatus('pending');
                toast.error('Account Pending', {
                    description: 'Your account is awaiting admin approval. You\'ll be notified once approved.'
                });
                return;
            }

            if (user.status === 'rejected') {
                setApprovalStatus('rejected');
                setRejectionReason(user.rejectionReason || 'No reason provided');
                toast.error('Account Rejected', {
                    description: user.rejectionReason || 'Your application was rejected.'
                });
                return;
            }

            // If approved, login and navigate
            loginWithToken(user, token);
            toast.success('Welcome back, ' + user.name + '!');
            navigate('/student/dashboard');
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || error.message || 'Login failed';
            const code = error.response?.data?.code;

            if (code === 'USER_NOT_FOUND') {
                toast.error('Account Not Found', {
                    description: 'Don\'t have an account? Sign up as a new student.'
                });
            } else if (code === 'ACCOUNT_PENDING_APPROVAL') {
                setApprovalStatus('pending');
                toast.error('Account Pending', {
                    description: 'Your account is awaiting admin approval. You\'ll be notified once approved.'
                });
            } else if (code === 'ACCOUNT_REJECTED') {
                setApprovalStatus('rejected');
                setRejectionReason(error.response?.data?.rejectionReason || 'No reason provided');
                toast.error('Account Rejected', {
                    description: error.response?.data?.rejectionReason || 'Your application was rejected.'
                });
            } else {
                toast.error('Login Failed', { description: errorMsg });
            }
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
                                Enter your Roll Number or Email to access your dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            {/* Status Alerts */}
                            {approvalStatus === 'pending' && (
                                <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800">
                                        Your account is pending admin approval. Check back soon!
                                    </AlertDescription>
                                </Alert>
                            )}

                            {approvalStatus === 'rejected' && (
                                <Alert className="mb-4 border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <p className="font-semibold">Account Rejected</p>
                                        <p className="text-sm mt-1">{rejectionReason}</p>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="identifier" className="text-sm font-medium">Roll Number or Email *</Label>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="e.g., 2024CS001 or student@email.com"
                                        className="h-11"
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">Use your roll number or registered email</p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || !identifier}
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="px-0 flex-col gap-4 border-t border-border pt-6 mt-2">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account? <Link to="/signup/student" className="text-blue-600 hover:underline font-medium">Sign up here</Link>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Having trouble? <a href="#" className="text-blue-600 hover:underline">Contact IT Support</a>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
